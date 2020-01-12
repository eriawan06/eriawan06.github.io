$(document).ready(function(){
    $('.sidenav').sidenav();
    loadnav();

    var league_id = ['2021','2014','2003','2002',];

    function loadnav() {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "navlist.html", true);
        xhttp.send();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200) return ;
                
                $('.sidenav, .topnav').html(xhttp.responseText);
                
                $('.brand-logo, .sidenav a, .topnav a').click(function(event) {
                    var sidenav = $('.sidenav');
                    M.Sidenav.getInstance(sidenav).close();

                    try {
                        page = event.target.getAttribute("href").substr(1);
                    }catch {
                        page = event.currentTarget.getAttribute("href").substr(1);    
                    }
                    if(page.includes("?")){
                        [page,param] = page.split("?");
                        loadPage(page);
                        getDataPerPage(page,param);
                    }else{
                        loadPage(page);
                        getDataPerPage(page);
                    }
                });
            }
        }
    }

    var page = window.location.hash.substr(1);
    var param = "";
    if (page == "") page = "home";

    if(page.includes("?")){
        [page,param] = page.split("?");
        loadPage(page);
        getDataPerPage(page,param);
    }else{
        loadPage(page);
        getDataPerPage(page);
    }

    function loadPage(page){
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "pages/" + page + ".html", true);
        xhttp.send(); 
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                var content = $('#body-content');
                if (this.status == 200) {
                    content.html(xhttp.responseText);
                    if(page=="fixture" || page=="standing" || page=="teams") $('.tabs').tabs();
                    else if(page==""||page=="home"){
                        $('.slider').slider({
                            fullWidth: true,
                        });
                        $('.slider').slider('start');
                    }else if(page=="admin"){
                        $('input#news-title, textarea#news-content').characterCounter();      
                        $('#form-add-news').submit(function(event) {
                            insertNews();
                            event.preventDefault();
                        })
                    }
                } else if (this.status == 404) {
                    content.html("<p>Halaman tidak ditemukan.</p>");
                } else {
                    content.html("<p>Ups.. halaman tidak dapat diakses.</p>");
                }
            }
        }       
    }

    function getDataPerPage(page,params){
        if(params!==undefined){
            var searchParam = new URLSearchParams(params);
        }

        if(page==""||page=="home") {
            showAllNewsHome();
            waitForEl('.detail-news-a',function() {
                $('.detail-news-a').click(function(event){                    
                    try {
                        page = event.target.getAttribute("href").substr(1);
                    }catch {
                        page = event.currentTarget.getAttribute("href").substr(1);    
                    }
                    console.log(page);
                    if(page.includes("?")){
                        [page,param] = page.split("?");
                        loadPage(page);
                        getDataPerPage(page,param);
                    }else{
                        loadPage(page);
                        getDataPerPage(page);
                    }
                });
            })
        }else if(page=="fixture") {
            league_id.forEach(function(id){
                getMatches(id);
            })
        }else if(page=="standing") {
            league_id.forEach(function(id){
                getStanding(id);
            })
            var x = window.matchMedia("(max-width: 992px)")
            maxWidth992(x) // Call listener function at run time
            x.addListener(maxWidth992) // Attach listener function on state changes
        
        
        }else if(page=="teams"){
            league_id.forEach(function(id){
                getTeams(id);
            })
        }else if(page=="favteams"){
            getFavoriteTeams();
        }else if(page=="admin"){
            readAllNewsTable();
        }else if(page=="detailnews"){
            showSingleNews(searchParam.get("newsId"))
        }
    }

    function insertNews() {
        var titleVal = $('#news-title').val();
        var contentVal = $('#news-content').val();
        var news = {
            createdAt   : new Date().toLocaleDateString("en-US", {weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'}),
            title       : titleVal,
            content     : contentVal,
        }
        dbInsertNews(news).then(function() {
            readAllNewsTable();
            $('#news-title').val("");
            $('#news-content').val("");
            var msgBox = `
                <div id="msg-box" class="row mb-5">
                    <div class="col s12">
                        <div class="row valign-wrapper margin-0">
                            <div class="col s10">
                                <p class="white-text">News has been added successfully</p>
                            </div>
                            <div class="col s1">
                                <a class="white-text" onclick="btnX()">X</a>  
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $("div.container.mb-50").prepend(msgBox);
            waitForEl("#msg-box",function() {
                $("#msg-box").addClass("green");
            })
        }).catch(function(err) {
            $('#news-title').val("");
            $('#news-content').val("");
            var msgBox = `
                <div id="msg-box" class="row mb-5">
                    <div class="col s12">
                        <div class="row valign-wrapper margin-0">
                            <div class="col s11">
                                <p class="white-text">Failed to add news</p>
                            </div>
                            <div class="col s1">
                                <a class="white-text" onclick="btnX()">X</a>  
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $("div.container.mb-50").prepend(msgBox);
            waitForEl("#msg-box",function() {
                $("#msg-box").addClass("red");
            })
            console.log(err);
        })
    }

    function showSingleNews(newsId) {
        console.log(newsId);
        dbGetSingleNews(parseInt(newsId))
        .then(function(news) {
            var singleNewsStructure = `
            <div class="card">
                <div class="card-content">
                    <p class="black-text fs-34 fw-bold mb-30">${news.title}</h2>
                    <p class="grey-text fs-12 mt-0 mb-0">${news.createdAt}</p>
                    <p class="mt-5">${news.content}</p>
                </div>
            </div>
            `;
            waitForEl('#single-news-col',function() {
                $('#single-news-col').html(singleNewsStructure);
            })
        }).catch(function(err){
            console.log(err);
        })
    }

    function showAllNewsHome() {
        dbGetAllNews().then(function(newsAll) {
            var listNewsStructure = "";
            newsAll.forEach(function(news,i) {
                if(i%2==0){
                    listNewsStructure += `
                    <div  class="col s12 m6">
                        <div class="row mb-15">
                            <div class="col s12">
                                <div class='card'>
                                    <div class='card-content'>
                                        <a class="detail-news-a" href="#detailnews?newsId=${news.newsId}">
                                            <p class="black-text fw-bold fs-18 mb-10">${news.title}</p>
                                        </a>
                                        <p class="grey-text fs-12 mt-0 mb-0">${news.createdAt}</p>
                                        <p class="custom-truncate mt-5">${news.content}</p>
                                    </div>
                                </div>        
                            </div>
                        </div>
                    </div>
                    `;
                    if(newsAll[i+1]!=undefined){
                        listNewsStructure += `
                        <div class="col s12 m6">
                            <div class="row mb-15">
                                <div class="col s12">
                                    <div class='card'>
                                        <div class='card-content'>
                                            <a class="detail-news-a" href="#detailnews?newsId=${newsAll[i+1].newsId}">
                                                <p class="black-text fw-bold fs-18 mb-10">${newsAll[i+1].title}</p>
                                            </a>
                                            <p class="grey-text fs-12 mt-0 mb-0">${newsAll[i+1].createdAt}</p>
                                            <p class="custom-truncate mt-5">${newsAll[i+1].content}</p>
                                        </div>
                                    </div>        
                                </div>
                            </div>
                        </div>
                        `;
                    }
                }
            });
            waitForEl('#news-section',function() {
                $('#news-section').html(listNewsStructure);
            })
        }).catch(function(err){
            console.log(err);
        })
    }

    function readAllNewsTable() {
        dbGetAllNews().then(function(newsAll) {
            var listNewsStructure = "";
            newsAll.forEach(function(news,i) {
                listNewsStructure += `
                <tr>
                    <td>${i+1}</td>
                    <td>${news.createdAt}</td>
                    <td>${news.title}</td>
                    <td>
                        <button id="${news.newsId}" class="btn deleteButton">Delete</button>
                    </td>
                </tr>
                `;
            });
            waitForEl('#table-news>tbody',function() {
                $('#table-news>tbody').html(listNewsStructure);
            })

            waitForEl('.btn.deleteButton',function() {
                let deleteButtons = $('.btn.deleteButton');
                for(let button of deleteButtons){
                    button.addEventListener("click",function(event) {
                        let newsId = parseInt(event.target.id);
                        dbDeleteNews(newsId).then(function() {
                            readAllNewsTable();
                        }).catch(function(err) {
                            console.log(err)
                        })
                    })
                }
            })
        }).catch(function(err){
            console.log(err);
        })
    }
});

function maxWidth992(x) {
    if(x.matches) {
        $("table.table-standing>thead>tr>th:contains('Team')").removeClass("pl-30");
        $("table.table-standing>thead>tr>th:contains('Team')").addClass("mb-15");
        waitForEl("table.table-standing>tbody>tr",function() {
            var tr = $("table.table-standing>tbody>tr");
            tr.each(function() {
                $(this).find("td:eq(0)").removeClass("pl-30");
                $(this).find("td:eq(0)>div").removeClass("valign-wrapper");
                $(this).find("td:eq(0)>div>div.col.s9").css("display","none");
                $(this).find("td:eq(0)>div>div.col.s1").css("margin-left","0");
            })
        })
    }else {
        console.log("AWWWWW");
        $("table.table-standing>thead>tr>th:contains('Team')").addClass("pl-30");
        $("table.table-standing>thead>tr>th:contains('Team')").removeClass("mb-15");
        waitForEl("table.table-standing>tbody>tr",function() {
            var tr = $("table.table-standing>tbody>tr");
            tr.each(function() {
                $(this).find("td:eq(0)").addClass("pl-30");
                $(this).find("td:eq(0)>div").addClass("valign-wrapper");
                $(this).find("td:eq(0)>div>div.col.s9").css("display","block");
                $(this).find("td:eq(0)>div>div.col.s1").css("margin-left","auto");
            })
        })
    }
}

function btnX() {
    $("#msg-box").css("display","none");
}