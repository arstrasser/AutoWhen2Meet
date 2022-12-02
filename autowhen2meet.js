// Alex Strasser
// 10/11/2022

const millisPerSec = 1000
const fifteenMinutes = 15 * 60 * millisPerSec
const fillDelay = 50;

function getGridTime(col, row) {
  return grid.children[row].children[col].id.substring(9) * millisPerSec
}

function toggleRange(col, row1, row2) {
  const time1 = getGridTime(col, row1) / millisPerSec
  const time2 = getGridTime(col, row2) / millisPerSec
  const elem1 = document.getElementById("YouTime"+time1)
  const elem2 = document.getElementById("YouTime"+time2)
  const event1 = new MouseEvent("mousedown", {target: elem1})
  const event2 = new MouseEvent("mouseover", {target: elem2})
  const event3 = new TouchEvent("touchend", {target: elem2, touches: [new Touch({target: elem2, identifier: 0, clientX: 0, clientY: 0})]})
  elem1.dispatchEvent(event1)
  elem2.dispatchEvent(event2)
  setTimeout(() => {
    elem2.dispatchEvent(event3)
  })
}

function updateAvailability() {
  const numRows = grid.children.length
  const numCols = grid.children[0].children.length
  
  const startTime = new Date(getGridTime(0, 0))
  const endTime = new Date(getGridTime(numCols - 1, numRows - 1))

  chrome.runtime.sendMessage({method: "getCalendarList", minTime: startTime.toISOString(), maxTime: endTime.toISOString()}, function(events) {
    let busyGrid = []

    for(let i = 0; i < numCols; i++) {
      busyGrid[i] = []
      for(let j = 0; j < numRows; j++) {
        let start = getGridTime(i, j)
        let end = start + fifteenMinutes
        let busy = false;
        for(let k = 0; k < events.length; k++) {
          let eventStart = new Date(events[k].start.dateTime).getTime()
          let eventEnd = new Date(events[k].end.dateTime).getTime()
          if((eventStart <= start && eventEnd > start) || (eventStart < end && eventEnd >= end) || (eventStart >= start && eventEnd <= end)) {
            busy = true
            break
          }
        }
        busyGrid[i][j] = busy
      }
    }

    let delay = fillDelay
    for (let i = 0; i < numCols; i++) {
      for (let j = 0; j < numRows; j++) {
        if (!busyGrid[i][j]) {
          let start = j
          while (j < numRows && !busyGrid[i][j]) {
            j++
          }

          setTimeout((i, j) => {
            toggleRange(i, start, j - 1)
          }, delay, i, j)
          delay += fillDelay
        }
      }
    }
  })
}

let grid = document.getElementById("GroupGridSlots")

if (grid) {
  var signInButton = document.getElementById("SignIn").children[0].children[1].children[1];

  signInButton.addEventListener("click",  () => {
    updateAvailability()
  })
}