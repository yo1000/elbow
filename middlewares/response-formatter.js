/**
 * Response formatter
 */
class ResponseFormatter {
    constructor(propertyName, outFormat) {
        this.propertyName = propertyName;
        this.outFormat = outFormat;
    }

    /**
     *
     * @param object
     * @returns {Object|String} Formatted object, or string
     */
    async format(object) {
        const props = this.propertyName.split(".");

        let value = await object;
        for (let prop of props) {
            if (Array.isArray(value)) {
                value = value.map(v => {
                    return v[prop];
                });
            } else {
                value = value[prop];
            }
        }

        if (this.outFormat === "text") {
            return this._scan(value);
        } else {
            let jsonContents = {};
            jsonContents[this.propertyName] = value;
            return jsonContents;
        }
    }

    _scan(value) {
        let s = "";
        if (Array.isArray(value)) {
            for (let v of value) {
                if (s) s += "\n";
                s += this._scan(v);
            }
        } else if (Object.prototype.toString.call(value) === "[object Object]") {
            for (let key in value) {
                if (s) s += "\n";
                s += this._scan(value[key]);
            }
        } else {
            if (s) s += "\n";
            s += value;
        }
        return s;
    }
}

module.exports.ResponseFormatter = ResponseFormatter;
