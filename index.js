"use strict";

let current_promise = undefined;

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
    current_promise = this.promise;
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
TreePromise.prototype.current_promise = undefined;


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
module.exports.condition = (bool, branch, value, then) => {
    if (typeof bool !== "boolean") throw new TypeError("TreePromise.condition(bool, branch): The first parameter must be of boolean type");
    if (!(branch instanceof Branch)) throw new TypeError("TreePromise.condition(bool, branch): The second parameter must be a Branch object");
    if (bool){
        let tree_promise = new TreePromise((resolve, reject)=>{
            if (then){
                resolve(value);
            }else{
                reject(value);
            }
        });
        for (let i=0; i<branch.do_list.length; i++){
            if (branch.do_list[i].name == "then"){
                const onFulfilled = branch.do_list[i].onFulfilled;
                const onRejected = branch.do_list[i].onRejected;
                tree_promise = tree_promise.then(onFulfilled, onRejected);
            }else{
                const onRejected = branch.do_list[i].onRejected;
                tree_promise = tree_promise.catch(onRejected);
            }
        }
    }
};





