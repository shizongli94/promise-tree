"use strict";

function TreePromise (executor){
    if (typeof executor === "function"){
        try{
            this.promise = new Promise(executor);
        }catch (e){
            throw new Error("Function passed in constructor is not valid!\n" + e.toString());
        }
    }else if(executor instanceof Promise){
        this.promise = executor;
    }else{
        throw new TypeError("TreePromise(executor): executor is not a function");
    }
    this.resolve = (value) => {
        this.promise.resolve(value);
    };
    this.reject = (reason) => {
        this.promise.reject(reason);
    };
    this.all = (iterable) => {
        this.promise.all(iterable);
    };
    this.race = (iterable) => {
        this.promise.race(iterable);
    };
    this.then = (onFulfilled, onRejected) => {
        if (!onRejected) {
            const promise = this.promise.then((value) => {
                return onFulfilled(value);
            });
            return new TreePromise(promise);
        } else {
            const promise = this.promise.then((value) => {
                return onFulfilled(value);
            }, (reason) => {
                return onRejected(reason);
            });
            return new TreePromise(promise);
        }
    };
    this.catch = (onRejected) => {
        const promise = this.promise.catch((reason) => {
            return onRejected(reason);
        });
        return new TreePromise(promise);
    };
}

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


module.exports.TreePromise = TreePromise;
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
            let tree_promise = new TreePromise((resolve, reject)=>{
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
                    tree_promise = tree_promise.then(onFulfilled, onRejected);
                }else{
                    const onRejected = this.branch.do_list[i].onRejected;
                    tree_promise = tree_promise.catch(onRejected);
                }
            }
            this.branch.do_list = [];
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





