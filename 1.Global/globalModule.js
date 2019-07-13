import qs from 'qs'
export default{
    install: function(Vue){
    	Vue.$httpRequestList = {} ;
	    Vue.prototype.getI18nKey =  function(key){
		    var self = this ;

		    return self.$t(key) ;
	    };
	    // 取消对应的地址的请求
	    Vue.prototype.cancelRequestServer = function(url){
	    	if(!url) return false;
	    	
	    	if(Vue.$httpRequestList[url] && Vue.$httpRequestList[url].length){
			    Vue.$httpRequestList[url].forEach(function(prevToken){
				    prevToken({
					    type: 'cancel' ,
					    message:'我是cancel的哈哈按'
				    });
			    });
		    }
 	    } ;
	    /**
	     *  统一请求方法
	     *  @param url        -   请求地址
	     *  @param method     -   get/post
	     *  @param options    -   请求对应的参数
	     *      {
	     *          onlyOneFlag         -   是否只允许捅一个接口只存在一个请求的标志
	     *
	     *          data                -   非get请求时传入的参数
	     *          params              -   get请求时传入的参数对象
	     *          successCallback     -   请求时200时的回调函数
	     *          errorCallback       -   非200时的回调
	     *          finallyCallback     -   请求结束后执行的回调
	     *      }
	     * */
        Vue.prototype.requestServer =  function(url , method , options){
		    if(!url || !method) return false ;
		    options = options || {} ;
		    this.axios({
			    url: url ,
			    responseType: options.responseType || "application/json" ,
			    headers: {
				    'Content-Type': options.contentType || 'application/json;charset=UTF-8'
			    } ,
			    method: method ,
			    data: options.data ,
			    params: options.params,
                paramsSerializer: function(params){
                    return qs.stringify(params, { indices: false });
                } ,
			    cancelToken: new this.axios.CancelToken(function executor (c) {
			    	if(options.onlyOneFlag){
			    		var uniqueKey = url + method.toLowerCase() ;
					    if(Vue.$httpRequestList[uniqueKey] && Vue.$httpRequestList[uniqueKey].length){
						    Vue.$httpRequestList[uniqueKey].forEach(function(prevToken){
							    prevToken({
								    type: 'cancel' ,
								    message:'我是cancel的哈哈按'
							    });
						    });
					    }
					    Vue.$httpRequestList[uniqueKey] = [] ;
					    Vue.$httpRequestList[uniqueKey].push(c) ;
				    }
			    })
		    }).then(function(response){
			    if(response.status === 200){
				    typeof options.successCallback === 'function' && options.successCallback(response.data) ;
			    }else{
				    typeof options.errorCallback === 'function' && options.errorCallback(response.data) ;
			    }
		    }).catch(function(error){
		    	console.log(error) ;
		    	if(error.message && error.message.type === 'cancel'){
		    	
			    }else{
				    typeof options.errorCallback === 'function' && options.errorCallback() ;
			    }
		    }).finally(function(){
			    typeof options.finallyCallback === 'function' && options.finallyCallback() ;
		    }) ;
	    } ;

        Vue.prototype.getErrorMessage = function(error_code, data){
	        if(error_code === undefined || error_code === '' || error_code < 0) return "";
	        var self = this , error_message = "" , errorMsg="" ;
	        if(typeof error_code !== 'object'){
		        error_code = error_code + "" ;
				error_message = self.$t("error_" + error_code) || "";
				console.log("msgParams: ", data&&data.msgParams);
				if (data&&data.msgParams) error_message = error_message.format(data.msgParams);
	        }else{
		        var errType = error_code.errType,
			        errCode = error_code.errCode;
		        if(errType && FocusMethod.isNumber(errType.row)){
			        if(FocusMethod.isNumber(errType.row)){
				        error_message += self.$t("error_"+errCode + "_prefix") + errType.row + self.$t("error_"+errCode + "_suffix") ;

				        if(errType.msg)
					        error_message += self.$t("error_"+errCode + "_column_prefix") + errType.msg + self.$t("error_"+errCode + "_column_suffix") ;
			        }
			        error_message += self.$t("error_"+errCode + "_" + errType.code);
		        }else
			        error_message = self.$t("error_"+errCode);
	        }
	        switch(error_code){
		        case "10007":
			        return data.exception;
		        case "10011":
		        case "notLogin":
		        case "not_login":
			        if(document.location.href.indexOf("/login") === -1)
				        document.location.href = '/#/login?redirect_url='+encodeURIComponent(document.location.href) ;
			        return self.$t('error_10011');
		        case "10017":
			        // 删除对象存在依赖关系  delete table / delete answer  ~~
			        if(data.promptMsg && data.promptMsg.answerNames){
				        // 批量删除answer时返回的结构
				        if(data.promptMsg.answerNames.length){
					        errorMsg += "<p class='data-title'>" + self.$t('error_10017_delete_success') + "</p>";
					        errorMsg += "<table class='data-list'>";
					        data.promptMsg.answerNames.forEach(function(name){
						        errorMsg += "<tr><td>"+ name +"</td></tr>";
					        });
					        errorMsg += "</table>" ;
				        }

				        if(data.promptMsg.dependencyInfos && data.promptMsg.dependencyInfos.length){
					        errorMsg += "<p class='data-title'>" + self.$t('error_10017_delete_failed') + "</p>";
					        errorMsg += "<table class='data-list'>";
					        errorMsg += "<tr><td>"+ (self.$t('prompt_message_name') || "Name")+"</td><td>"+ (self.$t('prompt_message_object') || "Object") +"</td><td>"+ (self.$t('prompt_message_type') || "Type") +"</td></tr>";
					        for(var i = 0 ; i < data.promptMsg.dependencyInfos.length ; i++){
						        var dependent = data.promptMsg.dependencyInfos[i] ;
						        errorMsg += '<tr><td rowspan="'+ dependent.length +'">' + dependent[0].compName + '</td>' ;
						        dependent && dependent.forEach(function(dep , i){
							        errorMsg += "<td>"+ dep.name +"</td><td>"+ dep.type +"</td></tr>";
							        if(i < dependent.length-1)
								        errorMsg += '<tr>' ;
						        });
					        }
					        errorMsg += "</tr></table>" ;
				        }
				        return errorMsg ;
			        }else{
				        // 单个删除table/answer时返回的结构
				        errorMsg = "<tr><td>"+ (self.$t('prompt_message_name') || "Name")+"</td><td>"+ (self.$t('prompt_message_type') || "Type")+"</td><td>"+(self.$t('data_table_header_group') || "GroupName") +"</td></tr>";
				        for(var i = 0 ; i < data.promptMsg.length ; i++){
					        errorMsg += "<tr><td>"+ data.promptMsg[i].name +"</td><td>"+ data.promptMsg[i].type +"</td><td>"+ data.promptMsg[i].groupName +"</td></tr>";
				        }
				        return "<p class='data-title'>" + error_message +"</p>" + "<table class='data-list'>"+errorMsg+"</table>";
			        }
		        case "worksheet_related":
			        errorMsg = "<tr><td>"+ (self.$t('prompt_message_name') || "Name")+"</td><td>"+ (self.$t('prompt_message_type') || "Type")+"</td><td>"+(self.$t('data_table_header_group') || "GroupName") +"</td></tr>";
			        data.related_info.forEach(function(relate){
				        errorMsg += "<tr><td>"+ relate.name +"</td><td>"+ relate.type +"</td><td>"+relate.groupName + "</td></tr>";
			        });
			        return "<p class='data-title'>" + error_message +"</p>" + "<table class='data-list'>"+errorMsg+"</table>";
		        case "10021" :
			        errorMsg = "<table class='data-list'>" ;
			        data.promptMsg.forEach(function(name){
				        errorMsg += "<tr><td>"+ name +"</td></tr>";
			        });
			        errorMsg += "</table>";
			        return "<p class='data-title'>" + error_message +"</p>" + errorMsg ;
		        case "10071":
			        // 部分删除不成功的
			        if(data.promptMsg){
				        if(data.promptMsg.notDeleted && data.promptMsg.notDeleted.length > 0){
					        errorMsg += "<p class='data-title'>" + self.$t('error_10071_delete_failed') + "</p>";
					        errorMsg += "<table class='data-list'>";

					        data.promptMsg.notDeleted.forEach(function(name){
						        errorMsg += "<tr><td>"+ name +"</td></tr>";
					        });

					        errorMsg += "</table>" ;
				        }

				        if(data.promptMsg.deleted && data.promptMsg.deleted.length > 0){
					        errorMsg += "<p class='data-title'>" + self.$t('error_10071_delete_success') + "</p>";
					        errorMsg += "<table class='data-list'>";

					        data.promptMsg.deleted.forEach(function(name){
						        errorMsg += "<tr><td>"+ name +"</td></tr>";
					        });

					        errorMsg += "</table>" ;
				        }
			        }

			        return errorMsg ;
		        case "10079":
			        var promptMsgs = data.promptMsg;

			        errorMsg = "<table class='table table-bordered'>";
			        errorMsg += "<tr><th>" + self.$t('share_obj_name') + "</th>" + "<th>" + self.$t('share_wrong_message') + "</th></tr>";
			        for(var i = 0;i < promptMsgs.length;i++){
				        var promptMsg = promptMsgs[i];
				        errorMsg += "<tr><td>" + promptMsg.name + "</td>" + "<td>" + promptMsg.shareName + "（" + promptMsg.shareType + "）" + "</td></tr>";
			        }
			        errorMsg += "</table>";
			        return "<p class='data-title'>" + error_message +"</p>" + errorMsg ;
		        case "10081":
			        var promptMsgs = data.promptMsg;
			
			        if(promptMsgs && promptMsgs.abnormal){
				        var disableReason = [];
				        promptMsgs.abnormal.forEach(function (reason) {
					        var curReason = self.$t('error_'+ reason);
					        if (curReason)
					        	disableReason.push(curReason);
				        });
				        return disableReason.join(vue.$t("logical_operator_and") + "<br/>");
			        }
			        return error_message;
		        case "10100":
			        var promptMsgs = data.promptMsg;

			        if(promptMsgs.SPECS_MAX_CSV_COLUMNS){
				        errorMsg = self.$t("error_10100_SPECS_MAX_CSV_COLUMNS") + promptMsgs.SPECS_MAX_CSV_COLUMNS ;
			        }else if(promptMsgs.SPECS_MAX_LEVEL1_GROUPS){
				        errorMsg = self.$t("error_10100_SPECS_MAX_LEVEL1_GROUPS") + promptMsgs.SPECS_MAX_LEVEL1_GROUPS ;
			        }
			        return error_message + errorMsg ;
		        case "11035":
			        if(data.promptMsg){
				        errorMsg += self.$t('error_11035_prefix') ;
				        if(data.promptMsg.type === 'loop'){
					        errorMsg += self.$t('error_11035_loop') ;
					        errorMsg += data.promptMsg.list[0] ;
					        errorMsg += self.$t('error_11035_parents_connect') ;
					        errorMsg += data.promptMsg.list[1] ;
					        errorMsg += self.$t('error_11035_parents');
				        }else if(data.promptMsg.type === 'inflation'){
					        errorMsg += self.$t('error_11035_inflation');
				        }else if(data.promptMsg.type === 'child_to_closure'){
					        errorMsg += data.promptMsg.list[0] + "  " ;
					        errorMsg += self.$t('error_11035_child_to_closure') ;
				        }else if(data.promptMsg.type === 'closure_has_child'){
					        errorMsg += data.promptMsg.list[0] + "  " ;
					        errorMsg += self.$t('error_11035_closure_has_child') ;
				        }else if(data.promptMsg.type === 'many_fan_trap'){
					        errorMsg += self.$t('error_11035_many_fan_trap') ;

					        errorMsg += "<table class='data-list'>";
					        data.promptMsg.list.forEach(function(name){
						        errorMsg += "<tr><td>"+ name +"</td></tr>";
					        });
					        errorMsg += "</table>";
				        }
			        }

			        return "<p class='data-title'>" + error_message +"</p>" + errorMsg ;
		        case "11039":
			        if(data.promptMsg){
				        errorMsg += "<table class='table table-bordered'>" ;

				        errorMsg += "<tr><th>"+ self.$t('data_column_attr_col_name') +"</th><th>"+ self.$t('data_column_attr_geotype') +"</th></tr>";
				        errorMsg += "<tr><td>"+ data.promptMsg.colName +"</td><td>"+ data.promptMsg.geo_type +"</td></tr>";
				        errorMsg += "</table>";
			        }

			        return "<p class='data-title'>" + error_message +"</p>" + errorMsg;
		        case "11040":
			        if(data.promptMsg){
				        errorMsg += "<table class='table table-bordered'>" ;

				        errorMsg += "<tr><th>"+ self.$t('data_column_attr_col_name') +"</th><th>"+ self.$t('data_column_attr_geotype') +"</th></tr>";
				        errorMsg += "<tr><td>"+ data.promptMsg.colName +"</td><td>"+ data.promptMsg.geo_type +"</td></tr>";
				        errorMsg += "</table>";
			        }

			        return "<p class='data-title'>" + error_message +"</p>" + errorMsg;
		        case "15023":
			        if(data.promptMsg && data.promptMsg.length){
				        errorMsg = "<table class='table table-bordered'>" ;
				        errorMsg += "<tr><th>"+ (self.$t('prompt_message_name') || "Name")+"</th><th>"+ (self.$t('prompt_message_reason') || "Reason")+"</th></tr>";
				        data.promptMsg.forEach(function(item){
					        errorMsg += '<tr><td>'+ item.tableName +'</td><td>'+ (self.$t("error_"+ (item.status && item.status.toLocaleLowerCase()))||"") +'</td></tr>'
				        });
				        errorMsg += "</table>";
			        }
			        return "<p class='data-title'>" + error_message +"</p>" + errorMsg  ;
	        }
	        return error_message;
        } ;

        Vue.prototype.ajaxErrorHandler = function(message, callback, data){
	        message += '';
	        var self = this;
	        if(message === "undefined" || message === '') message = "error" ;
	        var errorMessage = self.getErrorMessage(message, data);
	        if(errorMessage === false) return ;
	        if(!errorMessage) errorMessage =  self.getErrorMessage('error');


	        if(typeof errorMessage === 'string'){
		        if(typeof callback !== 'function')
			        this.promptMessage({
				        title: self.$t('prompt_error_message_title'),
				        message: errorMessage
			        });
		        else
			        this.promptMessage({
				        title: self.$t('prompt_error_message_title'),
				        message: errorMessage ,
				        callback: function(){
					        typeof callback === 'function' && callback.call(this) ;
				        }
			        });
	        }
        } ;

        Vue.prototype.promptMessage = function(options, $state){
	        var self = this ,
		        conf = {
			        winId: "#f-prompt-window" ,
			        title: self.$t('prompt_message_title'),
			        message : "" ,
			        callback: null ,
			        eventBind: null ,
			        jump : false ,
			        jumpMessage: "" ,
			        jumpTo: "" ,
			        finallyClear: null,
			        className: "" ,
			        submitText: self.$t('buttons_submit') ,
			        cancelText: self.$t('buttons_cancel') ,
			        submitAddClass: '' ,
			        submitStyle: '' ,
 			        cancelStyle: '' ,
			        errorMessage: ''
		        };
	        if (options === undefined) return;
	        if (typeof options === 'string') conf.message = options;
	        else if (typeof options === 'object') conf = $.extend({},conf,options);
	        let modal = $(options.winId).length? $ (options.winId) : $("#f-prompt-window"),
		        titleArea=modal.find(".modal-title"),
		        contentArea=modal.find(".modal-body"),
		        btnArea=modal.find(".modal-footer");
	        btnArea.find(".disabled").removeClass("disabled");
	        btnArea.find(".error-msg").html(conf.errorMessage || '');
	        titleArea.html(conf.title);
	        contentArea.html(conf.message) ;
	        btnArea.find(".btn-primary").attr('class' , 'btn-action btn-primary ' + (conf.submitAddClass || ''));
	        btnArea.find(".btn-primary").attr('style' , conf.submitStyle);
	        btnArea.find(".btn-primary").html(conf.submitText);
	        btnArea.find(".btn-default").attr('style' , conf.cancelStyle);
	        btnArea.find(".btn-default").html(conf.cancelText);
	        if (typeof conf.jump !== "undefined" && conf.jump) {
		        let btnJump = btnArea.find(".btn-primary");
		        btnJump.show();
		        btnJump.html(conf.jumpMessage);
		        modal.off("click", ".btn-primary").on("click", ".btn-primary" , function(){
			        $state.push({path: conf.jumpTo});
			        modal.modal("hide");
		        });
	        }
	        else if(!conf.callback)
		        btnArea.find(".btn-primary").hide();
	        else{
		        btnArea.find(".btn-primary").show();
		        modal.off("click", ".btn-primary").on("click", ".btn-primary", function(){
			        let self = $(this);
			        typeof conf.callback === 'function' && conf.callback.call(this, self, modal);
		        });
	        }

	        typeof conf.eventBind === 'function' && conf.eventBind.call(this , modal);
	        modal.modal("show");
	        modal.on("hidden.bs.modal" , function(){
		        if($(".modal.in:visible").length >0 ) {
			        $(document.body).addClass("modal-open");
		        }
		        btnArea.find(".error-msg").html("");
		        if (conf.className !== "") modal.find(".modal-dialog").removeClass(conf.className);

		        typeof conf.finallyClear === 'function' && conf.finallyClear.call(this , modal);
	        });
	        if (conf.className !== "") modal.find(".modal-dialog").addClass(conf.className);
        } ;

	    /**
	     * 处理BI返回的chart中的header
	     * 获取每个header的聚合方式 / 可切换的聚合列表
	     *  head.disableFilter  -   禁止filter的标识
	     *  head.disableAggregate   -   禁止切换聚合方式的标识
	     *  head.disableSort        -   禁止页面操作排序
	     */
        Vue.prototype.translateHeader = function(chartHeaders, searchText, sortList, applyAction){
	        var currentLang = this.$i18n.locale ;
	        if(!chartHeaders || searchText === undefined)return ;
	        var self = this ,
		        header = [], i, j , curSort ,aggret, colorFlag,
		        colorHeaders = applyAction && applyAction.headers,
		        biConfig = applyAction && applyAction.biConfigObj ,
		        headConfigure = applyAction && applyAction.headerConfigure;

	        colorFlag = !!colorHeaders ;
	        for(i = 0 ; i < chartHeaders.length ; i++){
		        var head = chartHeaders[i];
		        var addType = FocusMethod.numberType, // ['int','double','float','bigint','smallint'],
			        dateType= FocusMethod.dateType,//['timestamp','date','datetime','time'],
			        columnType= 'attribute' ,
		            yearOverYearFlag = false;
		        head.displayName='' ;
		        head.formatType='' ;
		        head.currencyType='' ;
		        head.decimalPoint= '';
		        head.isEmpty = head.is_empty !== false ;
		        head.preOperator = head.operator ;
		        if(colorFlag && colorHeaders[head.idx]){
			        head.colorFormattings = colorHeaders[head.idx].colorFormats ;
		        }
		        FocusMethod.classifyColumn(head);
		        // 从当前header的categories中获取是否经历过yearOverYear的操作
		        if(head.categories && head.categories.indexOf('year_over_year') > -1){
			        yearOverYearFlag = true ;
		        }
		        
		        
		        /**
		         *  获取当前列的原始属性
		         *  分组统计的header不做filter
		         *
		         *  如果当前header有对应的annotation则从annotation中获取columnType  ; 否则直接获取当前head的col_type属性
		         *
		         *  当原始属性是attribute ， 聚合属性是measure时 ， 只能选择count 与 distinct count
		         *  当原始属性是measure , 可选择所有
		         */
		        if(head.annotations && head.annotations.length){
			        FocusMethod.translateAnnotations(head.annotations , searchText);
			        var curannot = head.annotations[0].content;
			        if(curannot && curannot.category === "add_column_for_group_statistic"){
				        // 分组统计attribute列不做过滤
				        head.disableFilter = true ;
				        head.disableAggregate = true ;
				        head.disableSort = true ;
				        head.disableFormatFlag = true ;
			        }else if(curannot && curannot.category === 'expression'){
				        // 表达式列不允许切换聚合方式
				        columnType = head.col_type && head.col_type.toLowerCase() ;
				        head.disableAggregate = true ;
				        head.disableFilter = true ;
				        head.disableSort = true ;
				        head.disableFormatFlag = true ;
			        }
			        // 从annotation中获取普通列或者公式列的信息
			        
			        curannot && curannot.tokens.forEach(function(token){
				        if((token.columnId && token.columnId === head.col_uuid || token.value === head.col_name.split("(")[0])
					        && ["attribute",'measure',"formulaName"].indexOf(token.type)>-1){
					        columnType = token.type ;
				        }
			        });
		        }else{
			        // 当前header没有对应annotation时，禁止filter,禁止切换聚合方式,禁止排序
			        columnType = head.col_type && head.col_type.toLowerCase() ;
			        head.disableAggregate = true ;
			        head.disableFilter = true ;
			        head.disableSort = true ;
			        head.disableFormatFlag = true ;
		        }


		        // 当前数据参与了行转列后，BI生成的临时列全部不允许排序,不允许聚合,不允许filter ; 常规列不允许sort
		        if(biConfig && (biConfig.pivot || biConfig.unpivot)){
			        if(head.head_type === "non-instruction"){
				        head.disableSort = true ;
				        head.disableAggregate = true ;
				        head.disableFilter = true ;
				        head.disableFormatFlag = true ;
			        }else{
				        head.disableSort = true ;
			        }
		        }

		        if(!columnType) return ;
		        if(head.operator==='total') head.operator = "sum";
		        if(head.operator==='standard deviation') head.operator = "std_deviation" ;
		        if(head.operator==='unique count') head.operator = "count_distinct";
		        if(head.operator==="group statistics") head.operator = self.$t('search_operator_group_statistic');
		        // 先按照数值类型分配可切换聚合方式的列表
		        if(addType.indexOf(head.data_type) > -1 && FocusMethod.addAggregates[head.operator]!==undefined){
			        if(columnType === 'attribute'){
				        head.operatorList =FocusMethod.stringAggregates;
				        head.operator=FocusMethod.stringAggregates[head.operator];
			        }else{
				        head.operatorList = FocusMethod.addAggregates;
				        head.operator=FocusMethod.addAggregates[head.operator];
			        }
		        }
		        else if(dateType.indexOf(head.data_type) > -1 && FocusMethod.dateAggregates[head.operator || 'none']){
			        head.operatorList = FocusMethod.dateAggregates;
			        head.operator=FocusMethod.dateAggregates[head.operator || 'none'];
		        }
		        else if(head.data_type ==='string'&& FocusMethod.stringAggregates[head.operator]!==undefined){
			        head.operatorList = FocusMethod.stringAggregates;
			        head.operator = FocusMethod.stringAggregates[head.operator];
		        }
		        // 禁止切换聚合方式时，
		        if(head.disableAggregate){head.operatorList = undefined ;}
		        // 根据具体情况分配聚合方式 （增长率语句中的聚合方式 比 普通的日期列的聚合方式少一部分）
		        if(head.operatorList){
			        head.operatorList = FocusMethod.setAggretDisplayValue(head , currentLang ,head.operatorList , {
				        yearOverYearFlag: yearOverYearFlag
			        });
		        }
		        // 处理header的Operate对象的的翻译 ， 再不允许切换聚合方式的情况下 , displayValue是供页面使用的
		        if(head.operator && typeof head.operator !== 'string'){
			        if(head.operatorList){
				        // 如果有可切换的聚合方式列表， 则列表中已经处理了diaplayValue
				        head.operator = head.operatorList[head.operator.operate || 'none'];
			        }else{
				        if(currentLang === 'english'){
					        head.operator.displayValue = head.operator.english_value ;
				        }else{
					        head.operator.displayValue = head.operator.chinese_value ;
				        }
			        }
		        }

		        // 根据当前的排序列表，获取普通列是否排序了
		        if(sortList){
			        curSort = sortList[head.col_uuid+(dateType.indexOf(head.data_type)<0&&head.operator?'_'+head.operator.operate:'')];
			        // 当当前column的sortBy存在，且当前searchText没有被用户修改过，则作用于页面上，否则删掉
			        if(curSort !== undefined && curSort.sort!== undefined && searchText.indexOf(curSort.search.trim()) > -1){
				        head.sort = curSort.sort ;
				        curSort.show = true ;   //  true时表明当前列的sortBy已经作用在页面上了
			        }
		        }
		        // 在biConfig中找临时列是否排序了
		        if(biConfig&&biConfig.sort){
			        curSort = biConfig.sort.find(function(config){ return config.header && config.header.idx === head.idx ;});
			        if(curSort){
				        head.sort = curSort.order === 'desc'?1:0 ;
			        }
		        }

		        // 恢复保存的配置中每个表头列的配置信息  配置中保存的还是顺序
		        var curConfig = headConfigure && headConfigure.find(function(config){ return config.col_id === head.col_id||config.col_id === head.idx;});
		        if(curConfig){
			        if("direction" in curConfig){
				        head.direction=curConfig.direction;
			        }
			        if ("displayName" in curConfig) {
				        head.displayName = curConfig.displayName;
			        }
			        if ("goal" in curConfig) {
				        head.goal = curConfig.goal;
			        }
			        if ("formatType" in curConfig) {
				        head.formatType = curConfig.formatType;
			        }
			        if ("currencyType" in curConfig) {
				        head.currencyType = curConfig.currencyType;
			        }
			        if ("decimalPoint" in curConfig) {
				        head.decimalPoint = curConfig.decimalPoint;
			        }
		        }

		        header.push(head);
	        }
	        return header;
        };

	    // 解析BiConfigObj , 主要是可以展示在页面上
        Vue.prototype.translateBiConfig = function(chartHeaders , biConfigObj){
	        if(!biConfigObj || !chartHeaders) return false ;
	        var self = this ,currentLang = this.$i18n.locale ;
	        if(biConfigObj.page && biConfigObj.page.page_no){
		        biConfigObj.page.displayValue = self.$t('action_page_number') + "=" + biConfigObj.page.page_no ;
	        }

	        if(biConfigObj.sort){
		        biConfigObj.sort.forEach(function(sort){
			        if(!sort.header && chartHeaders[sort.header.idx]) return ;
			        if(currentLang === 'english'){
				        sort.displayValue = "sort by "+ FocusMethod.getDisplayOperateColumn(currentLang , chartHeaders[sort.header.idx]) + (sort.order==='desc'?' descending':' ascending');
			        }else{
				        sort.displayValue = '按'+FocusMethod.getDisplayOperateColumn(currentLang , chartHeaders[sort.header.idx]) +(sort.order==='desc'?'降序':'升序')+"排列的";
			        }
		        });
	        }

	        if(biConfigObj.filter){
		        biConfigObj.filter.forEach(function(filter){
			        if(!filter.header && chartHeaders[filter.header.idx]) return ;
			        filter.displayValue = FocusMethod.getDisplayOperateColumn(currentLang , chartHeaders[filter.header.idx]) + filter.operator + filter.value ;
		        });
	        }

        } ;
    }
};
