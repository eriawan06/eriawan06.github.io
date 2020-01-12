const base_url = "https://api.football-data.org/v2/";
var logoNotFound = "../assets/img/logo-not-found.png"
var waitForEl = function(selector, callback) {
    if (jQuery(selector).length) {
      callback();
    } else {
      setTimeout(function() {
        waitForEl(selector, callback);
      }, 100);
    }
};

const fetchAPI = function(url) {
    return fetch(url,{
        headers:{
            'X-Auth-Token':'f25b0ba292da4093942cd543bb9229a7'
        },
    })
    .then(function(response){
        if (response.status !== 200) {
            console.log("Error : " + response.status);
            // Method reject() akan membuat blok catch terpanggil
            return Promise.reject(new Error(response.statusText));
        } else {
            // Mengubah suatu objek menjadi Promise agar bisa "di-then-kan"
            return Promise.resolve(response);
        }
    })
    .then(function(response){
        return response.json()
    })
    .catch(function(err){
        console.log(err)
    });
}

const getTeamLogo = function(league_id) {
    var teamResourceURL = base_url + "competitions/"+league_id+"/teams/";
    return new Promise(function(resolve,reject){
        var teams_logo = new Array();
        if ('caches' in window) {
            caches.match(teamResourceURL).then(function(response) {
                if (response) {
                    response.json().then(function(data) {
                        data.teams.forEach(function(team) {
                            teams_logo.push({
                                'id'    : team.id,
                                'logo'  : team.crestUrl,
                            })
                        })
                        resolve(teams_logo);
                    })
                }else{
                    fetchAPI(teamResourceURL).then(function(data){
                        data.teams.forEach(function(team) {
                            teams_logo.push({
                                'id'    : team.id,
                                'logo'  : team.crestUrl,
                            })
                        })
                        resolve(teams_logo);
                    }).catch(function(err){
                        console.log(err);
                        reject(err);
                    })
                }
            })
        }
    })
}

// Blok Matches
function dateTimeSlicer(dt) {
    var date = dt.split("T")[0];
    var time = dt.split("T")[1].slice(0,5);
    var matchDateHTML = `
        <p class="mb-10 mt-20">${date}</p>
        <p class="mt-0">${time}</p>
    `;
    return matchDateHTML;
}

function matchesStructure(data,league_id) {
    var matchesHTML = "";
    var twoMatches = [];
    var matches = data.matches; 
    matches.forEach(function(match,i){
        twoMatches.push(match);
        if((i+1)%2==0 || (i+1)==matches.length){
            matchesHTML += `
                <div class="row white mb-0 border-bottom-4">
                    ${twoMatches.map((m,ix) =>
                        `<div class="col m6 s12 border-right-2 pl-35 pr-35 pt-10 pb-10" id="${league_id}${i}${ix}">
                            <div class="row mt-10 mb-5">
                                <div class="col s8">
                                    <div class="row valign-wrapper mb-10">
                                        <div class="col s2">
                                            <img class="team-logo-matches" id="${m.homeTeam.id}">
                                        </div>
                                        <div class="col s10">
                                            <p class="margin-0">${m.homeTeam.name}</p>
                                        </div>
                                    </div>
                                    <div class="row valign-wrapper mb-0">
                                        <div class="col s2">
                                            <img class="team-logo-matches" id="${m.awayTeam.id}">
                                        </div>
                                        <div class="col s10">
                                            <p class="margin-0">${m.awayTeam.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col s4 center-align border-left-1">
                                    ${dateTimeSlicer(m.utcDate)}
                                </div>
                            </div>
                        </div>`
                    ).join('')}
                </div>
            `;
            twoMatches.length = 0;
        }
    });
    
    switch (league_id){
        case '2021':
            $('#epl').html(matchesHTML);
            break;
        case '2014':
            $('#laliga').html(matchesHTML);
            break;
        case '2003':
            $('#eredivisie').html(matchesHTML);
            break;
        case '2002':
            $('#bundesliga').html(matchesHTML);
            break;
    }
    
    getTeamLogo(league_id).then(function(teams){
        var twoMatches2 = []
        matches.forEach(function(match,i){
            twoMatches2.push(match);
            if((i+1)%2==0 || (i+1)==matches.length){
                twoMatches2.forEach(function(m,ix){
                    var teamIds = [m.homeTeam.id,m.awayTeam.id];
                    teamIds.forEach(function(id){
                        var logoURL = teams.find(team => team.id === id).logo;
                        if(logoURL==null) $('#'+league_id+i+ix+'>div>div>div>div>#'+id).attr('src',''+logoNotFound);
                        else {
                            logoURL = logoURL.replace(/^http:\/\//i, 'https://');
                            $('#'+league_id+i+ix+'>div>div>div>div>#'+id).attr({
                                src     : ""+logoURL,
                                onError : "this.onerror=null;this.src='"+logoNotFound+"';",
                            });
                        }
                    })
                })
                twoMatches2.length = 0;
            }
        })
    }).catch(function(err){
        console.log(err);
        $('img.team-logo-matches').attr('src',''+logoNotFound);
    });
}
function getMatches(league_id) {
    var url = base_url + "competitions/"+league_id+"/matches?status=SCHEDULED";
    if ('caches' in window) {
        caches.match(url).then(function(response) {
            if (response) {
                response.json().then(function (data) {
                    matchesStructure(data,league_id);
                })
            }
        })
    }

    fetchAPI(url)
    .then(function(data){
        matchesStructure(data,league_id);
    })
    .catch(function(err){
        console.log(err);
    })
}

// Blok Standings
function standingStructure(data,league_id) {
    var standingHTML = "";
    data.standings[0].table.forEach(function(standing){
        var logoURL = standing.team.crestUrl
        if(logoURL===null) logoURL = logoNotFound;
        else logoURL = logoURL.replace(/^http:\/\//i, 'https://');
        standingHTML += `
            <tr data-id="${standing.team.id}">
                <td class="team-standing pl-30">
                    <div class="row mb-0 valign-wrapper">
                        <div class="col s2"><p class="margin-0"></p>${standing.position}</div>
                        <div class="col s1">
                            <img class="team-logo-standings" src="${logoURL}" 
                                onError="this.onerror=null;this.src='${logoNotFound}';"
                            >
                        </div>
                        <div class="col s9"><p class="margin-0">${standing.team.name}</p></div>
                    </div>
                </td>
                <td>${standing.playedGames}</td>
                <td>${standing.won}</td>
                <td>${standing.draw}</td>
                <td>${standing.lost}</td>
                <td>${standing.goalsFor}</td>
                <td>${standing.goalsAgainst}</td>
                <td>${standing.goalDifference}</td>
                <td>${standing.points}</td>
            </tr>
        `;
    });
    var tableStandingHTML = `
        <table class="responsive-table table-standing highlight">
            <thead class="grey lighten-2 center-align">
                <tr>
                    <th class="team-standing pl-30">Team</th>
                    <th>M</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th>P</th>
                </tr>
            </thead>
            <tbody class="white"></tbody>
        </table>
    `;

    switch (league_id){
        case '2021':
            $('#epl').html(tableStandingHTML);
            $('#epl>table>tbody').html(standingHTML);
            break;
        case '2014':
            $('#laliga').html(tableStandingHTML);
            $('#laliga>table>tbody').html(standingHTML);
            break;
        case '2003':
            $('#eredivisie').html(tableStandingHTML);
            $('#eredivisie>table>tbody').html(standingHTML);
            break;
        case '2002':
            $('#bundesliga').html(tableStandingHTML);
            $('#bundesliga>table>tbody').html(standingHTML);
            break;
    }
}
function getStanding(league_id) {
    var url = base_url + "competitions/"+league_id+"/standings?standingType=TOTAL";
    if ('caches' in window) {
        caches.match(url).then(function(response) {
            if (response) {
                response.json().then(function (data) {
                    standingStructure(data,league_id);
                })
            }
        })
    }

    fetchAPI(url)
    .then(function(data){
        standingStructure(data,league_id);
    })
    .catch(function(err){
        console.log(err);
    })
}

// Blok Teams
function teamsStructure(data,league_id) {
    var teamsHTML = "";
    var threeTeams = []
    var teams = data.teams;
    teams.forEach(function(team,i){
        threeTeams.push(team);
        if((i+1)%3==0 || (i+1)==data.count){
            teamsHTML += `
                <div class="row mb-0">
                    ${threeTeams.map(t =>
                        `<div class="col m4 s12">
                            <div class="card center-align">
                                <div class="card-content">
                                    <img class="team-logo-teams" 
                                        src="${t.crestUrl ? `${t.crestUrl.replace(/^http:\/\//i, 'https://')}` : `${logoNotFound}`}"
                                        onerror="this.onerror=null;this.src='${logoNotFound}';"
                                    >
                                    <span class="card-title">${t.name}</span>
                                    <p>${t.area.name}</p>
                                    <a target="_blank" href="${t.website.replace(/^http:\/\//i, 'https://')}" class="margin-0">
                                        ${t.website.replace(/^http:\/\//i, 'https://')}
                                    </a>
                                </div>
                                <div class="card-action">
                                    <button 
                                        class="btn waves-effect waves-light white-text"
                                        data-teamid="${t.id}" 
                                        onclick="addTeamToFavorite(this)">Add to Favorite
                                    </button>
                                </div>
                            </div>
                        </div>`
                    ).join('')}
                </div>
            `;
            threeTeams.length = 0;
        }
    });
    switch (league_id){
        case '2021':
            $('#epl').html(teamsHTML);
            break;
        case '2014':
            $('#laliga').html(teamsHTML);
            break;
        case '2003':
            $('#eredivisie').html(teamsHTML);
            break;
        case '2002':
            $('#bundesliga').html(teamsHTML);
            break;
    }
    teams.forEach(function(team) {
        dbGetSingleFavTeam(team.id).then(function(data) {
            const favorited = `<p class="fs-18 mt-5 mb-5 red-text">Favorite</p>`;
            $('button[data-teamid="'+team.id+'"]').parent().html(favorited);
        });
    })
}
function getTeams(league_id) {
    var url = base_url + "competitions/"+league_id+"/teams/";
    if ('caches' in window) {
        caches.match(url).then(function(response) {
            if (response) {
                response.json().then(function (data) {
                    teamsStructure(data,league_id);
                })
            }
        })
    }

    fetchAPI(url)
    .then(function(data){
        teamsStructure(data,league_id);
    })
    .catch(function(err){
        console.log(err);
    })
}
function addTeamToFavorite(btn){
    var team_id = btn.getAttribute('data-teamid')
    console.log("Add Team To Favorite... ",team_id);
    var card = $('button[data-teamid="'+team_id+'"]').parent();
    getTeamById(team_id).then(function(team) {
        dbInsertFavTeams(team);
        dbGetSingleFavTeam(parseInt(team_id)).then(function(data) {
            const favorited = `<p class="fs-18 mt-5 mb-5 red-text">Favorite</p>`;
            $('button[data-teamid="'+team_id+'"]').parent().html(favorited);
        }).catch(function(err) {
            alert('API ERROR');
        })
    }).catch(function(err) {
        console.log(err);
    })
}
function getTeamById(teamId) {
    return new Promise(function(resolve, reject) {
        var url = base_url + "/teams/"+teamId+"/";
        if ('caches' in window) {
            caches.match(url).then(function(response) {
                if (response) {
                    response.json().then(function (data) {
                        resolve(data);
                    })
                }
            })
        }

        fetchAPI(url)
        .then(function(data){
            resolve(data);
        })
        .catch(function(err){
            reject(err);            
        })
    });
}

// Blok Favorite Teams
function favTeamsStructure(data) {
    var teamsHTML = "";
    var threeTeams = [];
    data.forEach(function(team,i){
        threeTeams.push(team);
        if((i+1)%3==0 || (i+1)==data.length){
            teamsHTML += `
                <div class="row mb-0">
                    ${threeTeams.map(t =>
                        `<div class="col m4 s12">
                            <div class="card center-align">
                                <div class="card-content">
                                    <img class="team-logo-teams" 
                                        src="${t.crestUrl ? `${t.crestUrl.replace(/^http:\/\//i, 'https://')}` : `${logoNotFound}`}"
                                        onerror="this.onerror=null;this.src='${logoNotFound}';"
                                    >
                                    <span class="card-title">${t.name}</span>
                                    <p>${t.area.name}</p>
                                    <a target="_blank" href="${t.website.replace(/^http:\/\//i, 'https://')}" class="margin-0">
                                        ${t.website.replace(/^http:\/\//i, 'https://')}
                                    </a>
                                </div>
                                <div class="card-action">
                                    <button 
                                        class="btn deleteButton"
                                        data-teamid="${t.id}"
                                        onclick="removeTeamFromFavorite(this)">Remove From Favorite
                                    </button>
                                </div>
                            </div>
                        </div>`
                    ).join('')}
                </div>
            `;
            threeTeams.length = 0;
        }
    });
    waitForEl('#allfavteams',function() {
        $('#allfavteams').html(teamsHTML);
    })
}
function getFavoriteTeams() {
    dbGetAllFavTeams().then(function(data) {
        favTeamsStructure(data);
    }).catch(function(err) {
        console.log(err);
    })
}
function removeTeamFromFavorite(btn) {
    var team_id = btn.getAttribute('data-teamid')
    console.log("Remove Team From Favorite... ",team_id);
    dbDeleteFavTeam(parseInt(team_id)).then(function(status) {
        getFavoriteTeams();
    }).catch(function(err) {
        console.log(err);
    })
}

