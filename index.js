const { log } = require("console");
const express = require("express");

const app = express();
const port = 5000;

const db = require("./connection/db");

let isLogin = true;

app.set("view engine", "hbs");

app.use("/public", express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: false }));

db.connect(function (err, _, done) {
  console.log("Database Connection Succes");
});

app.get("/", function (req, res) {
  db.connect(function (err, client, done) {
    if (err) throw err; //nampilkan error koneksi di db

    client.query("SELECT * FROM tb_projects", function (err, result) {
      if (err) throw err;
      // console.log(result.rows);
      let data = result.rows;

      let dataProjects = data.map(function (item) {
        return {
          ...item,
          lengthDate: getDateDifference(
            new Date(item.start_date),
            new Date(item.end_date)
          ),
          posting: getDistanceTime(item.post_at),
        };
      });

      res.render("index", { isLogin, dataProjects: dataProjects });
    });
    done();
  });
});

app.get("/project", function (req, res) {
  res.render("myproject");
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/project-detail/:index", function (req, res) {
  res.render("project-detail", project);
});

app.get("/edit-project/:index", function (req, res) {
  res.render("edit-project", { isLogin: isLogin, edit, id: index });
});

app.get("/delete-project/:index", function (req, res) {
  res.redirect("/");
});

app.post("/project", function (req, res) {
  res.redirect("/");
});

app.post("/edit-project/:index", (req, res) => {
  res.redirect("/");
});

function getDateDifference(startDate, endDate) {
  if (startDate > endDate) {
    console.error("Start date must be before end date");
    return null;
  }
  let startYear = startDate.getFullYear();
  let startMonth = startDate.getMonth();
  let startDay = startDate.getDate();
  let endYear = endDate.getFullYear();
  let endMonth = endDate.getMonth();
  let endDay = endDate.getDate();

  let february =
    (endYear % 4 == 0 && endYear % 100 != 0) || endYear % 400 == 0 ? 29 : 28;

  let daysOfMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let startDateNotPassedInEndYear =
    endMonth < startMonth || (endMonth == startMonth && endDay < startDay);

  let years = endYear - startYear - (startDateNotPassedInEndYear ? 1 : 0);

  let months = (12 + endMonth - startMonth - (endDay < startDay ? 1 : 0)) % 12;

  let days =
    startDay <= endDay
      ? endDay - startDay
      : daysOfMonth[(12 + endMonth - 1) % 12] - startDay + endDay;

  return { years: years, months: months, days: days };
}

function getFullTime(waktu) {
  let month = [
    "Januari",
    "Febuari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  let date = waktu.getDate();
  let monthIndex = waktu.getMonth();
  let year = waktu.getFullYear();
  let hours = waktu.getHours();
  let minutes = waktu.getMinutes();

  let fullTime = `${date} ${month[monthIndex]} ${year}`;
  return fullTime;
}

function getDistanceTime(waktu) {
  let timeNow = new Date();
  let timePost = waktu;
  let distance = timeNow - timePost; // hasilnya milisecond
  // console.log(distance);

  let milisecond = 1000; // 1 detik 1000 milisecond
  let secondInHours = 3600; // 1 jam sama dengan 3600 detik
  let hoursInDay = 24; // 1 hari 24 jam

  let distanceDay = Math.floor(
    distance / (milisecond * secondInHours * hoursInDay)
  );
  let distanceHours = Math.floor(distance / (milisecond * 60 * 60));
  let distanceMinutes = Math.floor(distance / (milisecond * 60));
  let distanceSeconds = Math.floor(distance / milisecond);

  if (distanceDay > 0) {
    return `${distanceDay} day ago`;
  } else if (distanceHours > 0) {
    return `${distanceHours} hours ago`;
  } else if (distanceMinutes > 0) {
    return `${distanceMinutes} minutes ago`;
  } else {
    return `${distanceSeconds} seconds ago`;
  }
}

app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});
