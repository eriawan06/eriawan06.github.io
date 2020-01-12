const dbPromise = idb.open("topliga",1,function(upgradedb){
    switch(upgradedb.oldVersion){
        case 0 :    
            if (!upgradedb.objectStoreNames.contains("favteams")){
                var favteamsOS = upgradedb.createObjectStore(
                    "favteams",{
                        keyPath:"id",
                        unique:true,
                    }
                );
            }
            if (!upgradedb.objectStoreNames.contains("news")){
                var newsOS = upgradedb.createObjectStore(
                    "news",{
                        keyPath:"newsId",
                        autoIncrement:true,
                    }
                );
            }
    }
});

const dbInsertNews = function(news_data) {
    return new Promise(function(resolve,reject){
        dbPromise.then(function(db) {
            const transaction = db.transaction("news",`readwrite`);
            transaction.objectStore("news").put(news_data);
            return transaction;
        }).then(function(transaction) {
            if(transaction.complete) {
                resolve(true);
            }else {
                reject(new Error(transaction.onerror));
            }
        })
    })
};

const dbGetAllNews = function() {
    return new Promise(function(resolve,reject){
        dbPromise.then(function(db){
            const transaction = db.transaction("news",`readonly`);
            return transaction.objectStore("news").getAll();
        }).then(function(data){
            if(data !== undefined) {
                resolve(data);
            }else {
                reject(new Error('News not found'));
            }
        })
    })
};

const dbGetSingleNews = function(newsId) {
    return new Promise(function(resolve,reject){
        dbPromise.then(function(db){
            const transaction = db.transaction("news",`readonly`);
            return transaction.objectStore("news").get(newsId);
        }).then(function(data){
            if(data !== undefined) {
                resolve(data);
            }else {
                reject(new Error('News not found'));
            }
        })
    })
};

const dbDeleteNews = function(newsId) {
    return new Promise(function(resolve,reject) {
        dbPromise.then(function(db) {
            const transaction = db.transaction("news",`readwrite`);
            transaction.objectStore("news").delete(newsId);
            return transaction;
        }).then(function(transaction) {
            if(transaction.complete) {
                resolve(true);
            }else {
                reject(new Error(transaction.onerror));
            }
        })
    })
}

const dbInsertFavTeams = function(team_data) {
    return new Promise(function(resolve,reject){
        dbPromise.then(function(db) {
            const transaction = db.transaction("favteams",`readwrite`);
            transaction.objectStore("favteams").add(team_data);
            return transaction;
        }).then(function(transaction) {
            if(transaction.complete) {
                resolve(true);
            }else {
                reject(new Error(transaction.onerror));
            }
        })
    })
};

const dbGetSingleFavTeam = function(teamId) {
    return new Promise(function(resolve,reject){
        dbPromise.then(function(db){
            const transaction = db.transaction("favteams",`readonly`);
            return transaction.objectStore("favteams").get(teamId);
        }).then(function(data){
            if(data !== undefined) {
                resolve(data);
            }else {
                reject(new Error('Team not found'));
            }
        })
    })
};

const dbGetAllFavTeams = function() {
    return new Promise(function(resolve,reject){
        dbPromise.then(function(db){
            const transaction = db.transaction("favteams",`readonly`);
            return transaction.objectStore("favteams").getAll();
        }).then(function(data){
            if(data !== undefined) {
                resolve(data);
            }else {
                reject(new Error('Teams not found'));
            }
        })
    })
};

const dbDeleteFavTeam = function(teamId) {
    return new Promise(function(resolve,reject) {
        dbPromise.then(function(db) {
            const transaction = db.transaction("favteams",`readwrite`);
            transaction.objectStore("favteams").delete(teamId);
            return transaction;
        }).then(function(transaction) {
            if(transaction.complete) {
                resolve(true);
            }else {
                reject(new Error(transaction.onerror));
            }
        })
    })
}




