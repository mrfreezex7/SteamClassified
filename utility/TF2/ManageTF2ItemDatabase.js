const fs = require("mz/fs");
const request = require("request");
const path = require("path");
const Firebase = require("../firebase-db");

const rp = require("request-promise");
const cheerio = require("cheerio");

const TF2ItemNameDataURL = "https://backpack.tf/spreadsheet";
const TF2SkinsDataURL = "https://p337.info/tfview/index.php";
const TF2UnusualDataURL = "https://backpack.tf/developer/particles";
const TF2PaintDataURL = "https://wiki.teamfortress.com/wiki/Paint_Can";

const { log } = require("../../models/Logger");

const { ITEM_ICON_SIZE } = require("../../enum/site");

const tf2 = require("../../enum/tf2");
const { APP_ID } = require("../../enum/game");

class TF2ItemDatabase {
  static GetNSetTF2UnusualParticlePathDataFromBP = function (callback) {
    let UnusualData = {
      total: 0,
      data: {},
    };

    rp(TF2UnusualDataURL).then(async function (html) {
      const $ = cheerio.load(html);

      $("tr").each(function (i, elm) {
        let name = $(this).find(".text-muted").parent().text().trim();
        let filteredName = name.substr(name.indexOf(" ") + 1);
        let img = $(this).find("img").attr("src");

        if (img && filteredName) {
          UnusualData.data[filteredName] = img;
          UnusualData.total++;
        }
      });

      fs.readdir("./public/images/440/particles/")
        .then((listing) => {
          let total = UnusualData.total - listing.length;

          let jsResult = `export const data = ${JSON.stringify(
            UnusualData,
            null,
            2
          )}`;
          fs.writeFile("./public/js/particleDB.js", jsResult, function (err) {
            if (err) return callback(err);
            fs.writeFile(
              "./ItemsDB/TF2/TF2UnusualParticlesData.json",
              JSON.stringify(UnusualData, null, 2),
              function (err) {
                if (err) return callback(err);

                return callback(
                  "got all unusual img particle path data and stored in TF2UnusualParticlesData.json file, download required = " +
                    total +
                    " server restart required"
                );
              }
            );
          });
        })
        .catch((err) => {
          callback(err);
        });
    });
  };

  static GetTF2WarPaintsData = function () {
    const TF2WarPaintData = {};
    const TF2WarPaintFinalData = [];

    log.info("called war paint data");

    return new Promise((resolve, reject) => {
      rp(TF2SkinsDataURL).then(function (html) {
        const $ = cheerio.load(html);

        $(".warpaint").each(function (i, elm) {
          let name = $(this).find(".warpaint_name").text();
          let imageUrl = $(this).find("img").attr("src");

          if (!TF2WarPaintData[name]) {
            TF2WarPaintData[name] = {
              appID: APP_ID.TF2,
              name: name,
              type: "War Paint",
              image_url: imageUrl + ITEM_ICON_SIZE.TF2,
            };
          }
        });

        for (const key in TF2WarPaintData) {
          if (Object.hasOwnProperty.call(TF2WarPaintData, key)) {
            const element = TF2WarPaintData[key];
            TF2WarPaintFinalData.push(element);
          }
        }

        if (TF2WarPaintFinalData && TF2WarPaintFinalData.length > 0) {
          resolve(TF2WarPaintFinalData);
        } else if (!TF2WarPaintFinalData) {
          reject([]);
        } else if (TF2WarPaintFinalData.length <= 0) {
          reject([]);
        }
      });
    });
  };

  static async GetNSetTF2BackpackData(callback) {
    const TF2BackpackItemList = await GetTF2BackpackData();
    let ItemData = {};
    let ItemNameData = [];
    rp(TF2ItemNameDataURL).then(function (html) {
      const $ = cheerio.load(html);

      $("#pricelist > tbody > tr").each(function (i, result) {
        //  log.info($(this).find('img').attr('src'), $(this).find('.text-muted').parent().text(), i);
        let name = $($(this).contents("td")[0]).text();

        if (
          name.indexOf("(Non-Craftable)") === -1 &&
          ItemNameData.indexOf(name) === -1
        ) {
          let type = $($(this).contents("td")[1]).text();
          let isGenuine =
            $($(this).contents("td")[2]).text().trim().length > 0
              ? true
              : false;
          let isVintage =
            $($(this).contents("td")[3]).text().trim().length > 0
              ? true
              : false;
          let isUnique =
            $($(this).contents("td")[4]).text().trim().length > 0
              ? true
              : false;
          let isStrange =
            $($(this).contents("td")[5]).text().trim().length > 0
              ? true
              : false;
          let isHaunted =
            $($(this).contents("td")[6]).text().trim().length > 0
              ? true
              : false;
          let isCollectors =
            $($(this).contents("td")[7]).text().trim().length > 0
              ? true
              : false;

          // log.info(name, type, isGenuine, isVintage, isUnique, isStrange, isHaunted, isCollectors);

          let data = {
            appID: APP_ID.TF2,
            name: name,
            type: tf2.ITEM_TYPE[type.replace(/\n/g, "").trim()],
            image_url: "",
          };

          ItemNameData.push(name);

          ItemData[data.name.replace(/\./g, "")] = data;
        }
      });

      TF2BackpackItemList.forEach((bpItem) => {
        let itemDataKey = bpItem.name.replace(/\./g, "");
        if (ItemData[itemDataKey]) {
          let obj1 = {
            appID: ItemData[itemDataKey].appID,
            name: ItemData[itemDataKey].name,
            type: ItemData[itemDataKey].type,
            image_url: ItemData[itemDataKey].image_url,
          };

          let obj2 = {
            appID: bpItem.appID,
            name: bpItem.name,
            type: bpItem.type,
            image_url: bpItem.image_url,
          };

          if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
          } else {
            log.info(obj2);
            ItemData[obj2.name.replace(/\./g, "")] = obj2;
          }
        } else {
          ItemData[itemDataKey] = bpItem;
        }
      });

      request(
        "https://api.hexa.one/market/items/440?key=1182a44d-24ce-2e91-10d9-b7224b0aa064",
        async (error, response, body) => {
          log.info(response.statusCode);
          if (!error && response.statusCode === 200) {
            log.info("got items.starting item manupulation now");

            const TF2BackpackItemList = await GetTF2BackpackData();

            if (TF2BackpackItemList.length > 0) {
              TF2BackpackItemList.forEach((item) => {
                if (ItemData[item.name]) {
                  ItemData[item.name].image_url = item.image_url;
                }
              });
            }

            const items = JSON.parse(body);

            for (const key in items.result.items) {
              if (Object.hasOwnProperty.call(items.result.items, key)) {
                const element = items.result.items[key];

                if (ItemData[key] && ItemData[key].image_url == "") {
                  ItemData[key].image_url =
                    "https://steamcommunity-a.akamaihd.net/economy/image/" +
                    element.icon_url +
                    ITEM_ICON_SIZE.TF2;
                }
              }
            }

            Firebase.getDb()
              .collection("ItemsDB")
              .doc("TF2")
              .collection("TF2BackpackItems")
              .doc("database")
              .update(ItemData)
              .then(() => {
                return callback("TF2BackpackItems Data stored in db");
              })
              .catch((err) => {
                return callback("failed to store TF2BackpackItems data in db");
              });
          } else {
            callback(error);
          }
        }
      );
    });
  }

  static async GenerateTF2FinalData(callback) {
    const TF2BackpackItemList = await GetTF2BackpackData();
    const TF2WarPaintItemList = await TF2ItemDatabase.GetTF2WarPaintsData();

    let TF2FinalItemList = [...TF2BackpackItemList];

    log.info("Total Item : " + TF2FinalItemList.length);
    fs.writeFile(
      "./ItemsDB/TF2/TF2FinalData.json",
      JSON.stringify(TF2FinalItemList, null, 2),
      function (err) {
        if (err) return callback(err);
        return callback(
          "got all data and stored in TF2FinalData.json file.server restart required"
        );
      }
    );
  }
}

//TF2ItemDatabase.SetTF2BackpackData();

async function GetTF2BackpackData() {
  let TF2BackpackItemList = [];
  return new Promise((resolve, reject) => {
    Firebase.getDb()
      .collection("ItemsDB")
      .doc("TF2")
      .collection("TF2BackpackItems")
      .doc("database")
      .get()
      .then((doc) => {
        if (!doc.exists) {
          log.info("no TF2BackpackItems doc exists");
        } else {
          let bpData = doc.data();
          for (const key in bpData) {
            if (Object.hasOwnProperty.call(bpData, key)) {
              const element = bpData[key];
              TF2BackpackItemList.push(element);
            }
          }
          resolve(TF2BackpackItemList);
        }
      })
      .catch((err) => {
        log.info(err);
        reolve([]);
      });
  });
}

async function UpdateTF2Images() {
  let finalResult = {};
  const Data = require("../../ItemsDB/TF2/WorkTF2FinalData");

  Data.TF2Data.forEach((Item) => {
    if (Item) {
      finalResult[Item.name.replace(/\./g, "")] = Item;
    }
  });

  Firebase.getDb()
    .collection("ItemsDB")
    .doc("TF2")
    .collection("TF2BackpackItems")
    .doc("database")
    .update(finalResult)
    .then(() => {
      log.info("TF2BackpackItems Data stored in db");
    })
    .catch((err) => {
      log.info("failed to store TF2BackpackItems data in db");
    });
}

//UpdateTF2Images();
module.exports = TF2ItemDatabase;
