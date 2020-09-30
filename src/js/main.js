import jQuery from "jquery"

window.$ = window.jQuery = jQuery

const table = document.querySelector("table tbody")
const coeff = document.querySelector("#coeff").value
const font = document.querySelector("#font").value

$(function () {
  const rows = document.querySelectorAll("tbody tr")

  for (let i = 1; i <= rows.length; i++) {
    // const row = document.querySelector("tbody tr:nth-child(" + i + ")")
    const cells = document.querySelectorAll("tbody tr:nth-child(" + i + ") td");

    for (let ci = 1; ci <= cells.length; ci++) {
      const cell = table.querySelector("tr:nth-child(" + i + ") td:nth-child(" + ci + ")")
      const prevCell = table.querySelector("tr:nth-child(" + i - 1 + ") td:nth-child(" + ci + ")")

      if (i == 1 && ci == 2) {

        cell.innerHTML = Math.round(coeff * font)

      } else if (i == 2 && ci == 2) {
        cell.innerHTML = Math.round((font - prevCell) / 2 + prevCell);
      }
    }

  }

})
