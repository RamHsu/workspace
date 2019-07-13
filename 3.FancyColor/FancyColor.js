class FancyColor {
    constructor({startColor="rgb(255, 255, 255)", endColor="rgb(0, 0, 0)", step=10, bgColor="rgb(255, 255, 255)"}) {
        let self = this;
        self.startColor = startColor;
        self.endColor = endColor;
        self.step = step;
        self.bgColor = bgColor;
    }

    getGradientColor() {
        let self = this;
        let step = self.step - 1;
        let gradientColor = [];

        let startRGB = self.getRgbArr(self.startColor);
        let startR = startRGB[0];
        let startG = startRGB[1];
        let startB = startRGB[2];

        let endRGB = self.getRgbArr(self.endColor);
        let endR = endRGB[0];
        let endG = endRGB[1];
        let endB = endRGB[2];

        let sR = (endR - startR) / step;
        let sG = (endG - startG) / step;
        let sB = (endB - startB) / step;

        for (let i = 0; i < self.step; i++) {
            let hex = self.color2Hex("rgb(" + Math.round(sR * i + startR) + "," + Math.round(sG * i + startG) + "," + Math.round(sB * i + startB) + ")");
            gradientColor.push(hex);
        }
        return gradientColor;
    }

    getColorType(color) {
        // let self = this;
        let colorStr = color.toLowerCase() || "";
        let rgbaReg = /^(rgba)/;
        let rgbReg = /^(rgb)/;
        let hexReg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
        let type = false;
        if (rgbaReg.test(colorStr)) {
            type = "rgba";
        } else if (rgbReg.test(colorStr)) {
            type = "rgb";
        } else if (hexReg.test(colorStr)) {
            type = "hex";
        }
        return type;
    }

    getRgbArr(color) {
        let self = this;
        return self.color2Rgb(color).split("(")[1].split(")")[0].split(",").map(d => parseFloat(d));
    }

    color2Rgb(color) {
        let self = this;
        let colorStr = color.toLowerCase() || "";
        let rgbColor = null;
        let colorType = self.getColorType(colorStr);
        switch(colorType) {
            case "rgba": 
                rgbColor = self.rgba2Rgb(colorStr);
                break;
            case "rgb":
                rgbColor = colorStr;
                break;
            case "hex":
                let rgbParam = [];
                if (colorStr.length === 4) {
                    let hexStr = "#";
                    for (let i = 1; i < 4; i += 1) {
                        hexStr += colorStr.slice(i, i + 1).concat(colorStr.slice(i, i + 1));
                    }
                    colorStr = hexStr;
                }
                for (let i = 1; i < 7; i += 2) {
                    rgbParam.push(parseInt("0x" + colorStr.slice(i, i + 2)));
                }
                rgbColor = "rgb(" + rgbParam[0] + ", " + rgbParam[1]  + ", " + rgbParam[2]  + ")";
                break;

        }

        return rgbColor;
    }

    color2Hex(color) {
        let self = this;
        let colorStr = color.toLowerCase() || "";
        let colorType = self.getColorType(colorStr);
        let hexStr = "#";

        switch(colorType) {
            case "rgba": 
                colorStr = self.rgba2Rgb(colorStr, self.bgColor);
            case "rgb":
                let RGB = self.getRgbArr(colorStr);
                for (let i = 0; i < RGB.length; i++) {
                    let hex = Math.round(RGB[i]).toString(16);
                    hex = hex.length === 1 ? "0" + hex : hex;
                    if (hex === "0") {
                        hex += hex;
                    }
                    hexStr += hex;
                }
                break;
            case "hex":
                let aNum = colorStr.replace(/#/, "").split("");
                if (aNum.length === 3) {
                    for (let i = 0; i < aNum.length; i += 1) {
                        hexStr += aNum[i] + aNum[i];
                    }
                }
                break;
        }

        return hexStr;
    }

    rgba2Rgb(color, bgColor="rgb(255, 255, 255)") {
        let self = this;
        let colorStr = color.toLowerCase() || "";
        let colorType = self.getColorType(colorStr);
        let bgColorStr = self.color2Rgb(bgColor);
        let bgColorType = self.getColorType(bgColorStr);
        let rgbColor = null;

        if (bgColorType !== "rgb") return false;

        switch(colorType) {
            case "rgba": 
                let colorParam = colorStr.split("(")[1].split(")")[0].split(",").map(d => parseFloat(d));
                let bgParam = self.getRgbArr(bgColorStr);
                let alpha = colorParam[3];
                let r = Math.round(bgParam[0] * (1 - alpha) + colorParam[0] * alpha);
                let g = Math.round(bgParam[1] * (1 - alpha) + colorParam[1] * alpha);
                let b = Math.round(bgParam[2] * (1 - alpha) + colorParam[2] * alpha);
                rgbColor = "rgb(" + r + ", " + g + ", " + b +")";
                break;
            case "rgb":
                rgbColor = colorStr;
                break;
            case "hex":
                rgbColor = self.color2Rgb(color);
                break;
        }

        return rgbColor;
    }
}