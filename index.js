"use strict";

function Branch () {
    this.do_list = [];
    this.then = (onFulfilled, onRejected) => {
        this.do_list.push({
            name: "then",
            onFulfilled: onFulfilled,
            onRejected: onRejected
        });
        return this;
    };
    this.catch = (onRejected) => {
        this.do_list.push({
            name: "catch",
            onRejected:onRejected
        });
        return this;
    };
}


module.exports.Branch = Branch;
module.exports.condition = {
    bool : undefined,
    branch:undefined,
    value:undefined,
    then:undefined,
    ready : function () {
        return (this.bool !== undefined && this.branch !== undefined && this.value !== undefined && this.then !== undefined);
    },
    execute : function() {
        if (typeof this.bool !== "boolean") throw new TypeError("Branching criterion is not boolean");
        if (!(this.branch instanceof Branch)) throw new TypeError("Tree branch is not an insance of Branch");
        if (typeof this.then !== "boolean") throw new TypeError("Indicator for origin is not boolean");
        if (this.bool){
            let promise = new Promise((resolve, reject)=>{
                if (this.then){
                    resolve(this.value);
                }else{
                    reject(this.value);
                }
            });
            for (let i=0; i<this.branch.do_list.length; i++){
                if (this.branch.do_list[i].name == "then"){
                    const onFulfilled = this.branch.do_list[i].onFulfilled;
                    const onRejected = this.branch.do_list[i].onRejected;
                    promise = promise.then(onFulfilled, onRejected);
                }else{
                    const onRejected = this.branch.do_list[i].onRejected;
                    promise = promise.catch(onRejected);
                }
            }
            this.branch.do_list = [];
            this.branch.promise = promise;
            this.bool = undefined;
            this.branch = undefined;
            this.value = undefined;
            this.then = undefined;
        }
    },
    "if" : function(bool) {
        this.bool = bool;
        if (this.ready()) this.execute();
        return this;
    },
    unless : function (bool) {
        this.if(!bool);
    },
    from : function (then) {
        this.then = then;
        if (this.ready()) this.execute();
        return this;
    },
    "with" : function(value) {
        this.value = value;
        if (this.ready()) this.execute();
        return this;
    },
    along : function(branch) {
        this.branch = branch;
        if (this.ready()) this.execute();
        return this;
    },
};





