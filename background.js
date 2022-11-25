// Alex Strasser
// 10/11/2022

let token = ""

chrome.identity.getAuthToken({ 'interactive': true }, function (t) {
  token = t;
});


function listCalendars() {
  let p = new Promise((resolve, reject) => {
    fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList",
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }).then(response => response.json()).then(json => {
      console.log(json);
      resolve(json);
    }).catch(err => {
      reject(err);
    })
  })
  return p
}

function getCalendar(calendarId, minTime, maxTime) {
  let p = new Promise((resolve, reject) => {
    fetch("https://www.googleapis.com/calendar/v3/calendars/"+calendarId+"/events?singleEvents=true&timeMin="+minTime+"&timeMax="+maxTime, 
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      
    }).then(response => response.json()).then(json => {
      console.log(json);
      resolve(json.items)
    }).catch(err => {
      console.log(err);
    })
  })
  return p
}

// function getFreeBusy(minTime, maxTime) {
//   let p = new Promise((resolve, reject) => {
//     fetch("https://www.googleapis.com/calendar/v3/freeBusy", 
//     {
//       method: "POST",
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token
//       },
//       body: {
//         "timeMin": minTime,
//         "timeMax": maxTime,
//       }
//     }).then(response => response.json()).then(json => {
//       console.log(json);
//       resolve(json.items)
//     }).catch(err => {
//       console.log(err);
//     })
//   })
//   return p
// }

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "getCalendarList") {
    listCalendars().then((response) => {
      for (let i = 0; i < response.items.length; i++) {
        if (response.items[i].primary) {
          getCalendar(response.items[i].id, request.minTime, request.maxTime).then(response => {
            sendResponse(response)
          })
          break
        }
      }
    })
    return true;
  }
});