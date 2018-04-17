var storeThreads = [];

var closeThread = (thread_id) => {
    var isHere = false;
    for (var i = 0; i < storeThreads.length; i++) {
        if (storeThreads[i].ID === thread_id) {
            storeThreads.splice(i,1);
            var isHere = true;
            break;
        }
    }
    return new Promise((resolve,reject) => {
        return resolve();
    });
}

var createThread = (thread_id,room,cmd,user) => {
    var isHere = false;
    for (var i = 0; i < storeThreads.length; i++) {
        if (storeThreads[i].ID === thread_id) {
            isHere = true;
            console.log("Thread already exist "+thread_id);
            break;
        }
    }
    if (!isHere) {
        console.log("Create Thread "+thread_id);
        var newThread = {
            ID: thread_id,
            room: room,
            cmd: cmd
        }
        storeThreads.push(newThread);
    }
    return new Promise((resolve, reject) => {
        return resolve();
    });
}

var checkThread = (command_ori,room) => {
    var command = command_ori.split(' ')[0];
    console.log("Commande extraite "+command);
    var thread_id = null;
    console.log(storeThreads);
    for(var i = 0; i<storeThreads.length; i++) {
        if(storeThreads[i].cmd === command && storeThreads[i].room === room){
            console.log("Thread associé à la salle "+room+" et a la commande "+command+" trouvé");
            thread_id = storeThreads[i].ID;
            break;
        }
    }
    if(!thread_id){
        console.log("Thread non trouvé");
    }
    return new Promise((resolve,reject) => {
        console.log("Thread id "+thread_id);
        return resolve(thread_id);
    });
}

var handleThread = (thread_id_source,thread_id_return,room,command, interactive) =>{
    command = command.split(' ')[0];
    console.log(command);
    if(interactive){
        console.log("Interactive true, continue or create THread");
        return createThread(thread_id_return,room,command);
    }
    else{
        console.log("Interactive false");
        if(thread_id_source){
            console.log("Close thread "+thread_id_source);
            return closeThread(thread_id_source);
        }
        else{
            console.log("No thread");
            return new Promise((resolve,reject) => {
                return resolve();
            });
        }
    }
}

module.exports = {
    handleThread,
    checkThread
}
