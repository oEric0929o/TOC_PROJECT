function doPost(e) {
  
  var spreadSheet = SpreadsheetApp.openById("1LoR446X98jPyb9oE8rxuZPpVgYOHX8JYH1ju1GL6czE");
  var sheet = spreadSheet.getSheets()[0];
  
  var CHANNEL_ACCESS_TOKEN = "u/Mkyr8LwjrCak1ujNFnX1AYQcfYzo6v0pgED0LL8mA0UEjovNe2iR/ftPE+MTqmP+OuX3vdlTj+l6ZuuZ6u0brrTpMUVho+OpnncKL4J8uIfHJAN9V4VvaGuhPbKDD+5NqhAk1a1GFvNOpwTMS72AdB04t89/1O/w1cDnyilFU=";
  var msg = JSON.parse(e.postData.contents);
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;
  var clientID = msg.events[0].source.userId;

  if (typeof replyToken === "undefined") {
    return;
  }
  
  //未註冊的註冊，已註冊的判斷是誰
  var register = 0;
  var userNum;
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var sheetData = sheet.getSheetValues(1, 1, lastRow, lastColumn);
  for (var i = 0; i < lastRow; ++i) {   
    if (sheetData[i][0] == clientID) {
      register = 1;
      userNum = i;
      break;
    }
  }
  if (register == 0) {
    sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, userMessage + "，註冊成功");
    var userPwd = Math.floor(Math.random()*100)+1;
    var userData = [clientID, userMessage, userPwd, "否", 1];
    sheet.appendRow(userData);
    return;
  }
  
  if (userMessage=="積分") {
    sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "當前積分: " + sheetData[userNum][4]);
    return;
  }
  
  if (userMessage=="排行榜") {
    var replyText = ""
    for (var i = 1; i < lastRow; ++i) {
      replyText += sheetData[i][1];
      replyText += ": ";
      replyText += sheetData[i][4];
      replyText += "分\n";
    }
    sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, replyText);
    return;
  }         
  
  if (userMessage=="FSM") {
    sendFSMDiagram(CHANNEL_ACCESS_TOKEN, replyToken);
    return;
  }
  
  if (sheetData[userNum][3]=="否") {
    if (userMessage == "進入遊戲") {
      sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "請輸入下注積分(1~10的整數)");
      sheet.getRange(userNum + 1, 4).setValue("選");
      return;
    }
    sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "積分: 查詢自己的積分\n排行榜: 查詢全部人的積分\n進入遊戲: 開始一局新的遊戲\n放棄: 放棄當前遊戲\n\n每局遊戲有5次機會猜終極密碼，越快猜中獲得積分倍率越高");
    return;
  }
  
  if (sheetData[userNum][3]=="選") {
    var userPoint = parseInt(sheetData[userNum][4], 10)
    var selectPoint = parseInt(userMessage, 10)
    if (selectPoint>=parseInt(1, 10)&&selectPoint<=parseInt(10, 10)) {
      if (selectPoint>userPoint) {
        sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "積分不足");
        return;
      }
      sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "遊戲開始! 請在5輪之內猜出1~100中的終極密碼!");
      sheet.getRange(userNum + 1, 4).setValue("是");
      sheet.getRange(userNum + 1, 5).setValue(sheetData[userNum][4] - selectPoint);
      sheet.getRange(userNum + 1, 6).setValue(userMessage);
      sheet.getRange(userNum + 1, 7).setValue(4);
      return
    }
    sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "請輸入下注積分(1~10的整數)");
    return;
  }
  
  if (sheetData[userNum][3]=="是") {
    var currentPwd = sheetData[userNum][2]
    var userGuess = parseInt(userMessage, 10)
    if (userGuess>=parseInt(1, 10)&&userGuess<=parseInt(100, 10)) {
      if (userGuess>currentPwd) {
        sheet.getRange(userNum + 1, 7).setValue(sheetData[userNum][6] - 1);
        if (sheetData[userNum][6]==0) {
          sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "遊戲失敗，終極密碼是" + currentPwd)
          var newPwd = Math.floor(Math.random()*100)+1;
          sheet.getRange(userNum + 1, 3).setValue(newPwd);
          sheet.getRange(userNum + 1, 4).setValue("否");
          if (sheetData[userNum][4]==0) {
            sheet.getRange(userNum + 1, 5).setValue(1);
          }
          return;
        }
        sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "比" + userMessage + "小，還剩" + sheetData[userNum][6] + "次機會");
        return;
      }
      if (userGuess<currentPwd) {
        sheet.getRange(userNum + 1, 7).setValue(sheetData[userNum][6] - 1);
        if (sheetData[userNum][6]==0) {
          sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "遊戲失敗，終極密碼是" + currentPwd)
          var newPwd = Math.floor(Math.random()*100)+1;
          sheet.getRange(userNum + 1, 3).setValue(newPwd);
          sheet.getRange(userNum + 1, 4).setValue("否");
          if (sheetData[userNum][4]==0) {
            sheet.getRange(userNum + 1, 5).setValue(1);
          }
          return;
        }
        sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "比" + userMessage + "大，還剩" + sheetData[userNum][6] + "次機會");
        return;
      }
      if (userGuess==currentPwd) {
        if (sheetData[userNum][6]==4) {
          sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "Bingo! 獲得" + sheetData[userNum][5]*30 + "積分");
          sheet.getRange(userNum + 1, 5).setValue(sheetData[userNum][4] + 30 * sheetData[userNum][5]);
        }
        if (sheetData[userNum][6]==3) {
          sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "Bingo! 獲得" + sheetData[userNum][5]*15 + "積分");
          sheet.getRange(userNum + 1, 5).setValue(sheetData[userNum][4] + 15 * sheetData[userNum][5]);
        }
        if (sheetData[userNum][6]==2) {
          sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "Bingo! 獲得" + sheetData[userNum][5]*5 + "積分");
          sheet.getRange(userNum + 1, 5).setValue(sheetData[userNum][4] + 5 * sheetData[userNum][5]);
        }
        if (sheetData[userNum][6]==1) {
          sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "Bingo! 獲得" + sheetData[userNum][5]*3 + "積分");
          sheet.getRange(userNum + 1, 5).setValue(sheetData[userNum][4] + 3 * sheetData[userNum][5]);
        }
        if (sheetData[userNum][6]==0) {
          sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "Bingo! 獲得" + sheetData[userNum][5]*2 + "積分");
          sheet.getRange(userNum + 1, 5).setValue(sheetData[userNum][4] + 2 * sheetData[userNum][5]);
        }
        var newPwd = Math.floor(Math.random()*100)+1;
        sheet.getRange(userNum + 1, 3).setValue(newPwd);
        sheet.getRange(userNum + 1, 4).setValue("否");
        return;
      }
    }
    if (userMessage=="放棄") {
      sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "已放棄當前遊戲");
      if (sheetData[userNum][4]==0) {
        sheet.getRange(userNum + 1, 5).setValue(1);
      }
      var newPwd = Math.floor(Math.random()*100)+1;
      sheet.getRange(userNum + 1, 3).setValue(newPwd);
      sheet.getRange(userNum + 1, 4).setValue("否");
      return;
    }
    sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, "請輸入1~100的整數");
    return;
  }
}


function sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, replyText)
{
  var url = "https://api.line.me/v2/bot/message/reply";
  UrlFetchApp.fetch(url, {
      "headers": {
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    "method": "post",
    "payload": JSON.stringify({
      "replyToken": replyToken,
      "messages": [{
        "type": "text",
        "text": replyText,
      }],
    }),
  });
}

function sendFSMDiagram(CHANNEL_ACCESS_TOKEN, replyToken)
{
  var url = "https://api.line.me/v2/bot/message/reply";
  UrlFetchApp.fetch(url, {
      "headers": {
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    "method": "post",
    "payload": JSON.stringify({
      "replyToken": replyToken,
      "messages": [{
        "type": "image",
        "originalContentUrl": "https://scontent-tpe1-1.xx.fbcdn.net/v/t39.30808-6/268972719_206988121643436_4267138718852128373_n.jpg?_nc_cat=107&_nc_rgb565=1&ccb=1-5&_nc_sid=730e14&_nc_ohc=1qVPsWd80vkAX8N9GH8&tn=LJABqW2kIVs5g-_m&_nc_ht=scontent-tpe1-1.xx&oh=00_AT_D5xpsV1x_7zekI_wSXbttc1hvXITqMFh-SjZuAkiCEQ&oe=61D70B49",
        "previewImageUrl": "https://scontent-tpe1-1.xx.fbcdn.net/v/t39.30808-6/268972719_206988121643436_4267138718852128373_n.jpg?_nc_cat=107&_nc_rgb565=1&ccb=1-5&_nc_sid=730e14&_nc_ohc=1qVPsWd80vkAX8N9GH8&tn=LJABqW2kIVs5g-_m&_nc_ht=scontent-tpe1-1.xx&oh=00_AT_D5xpsV1x_7zekI_wSXbttc1hvXITqMFh-SjZuAkiCEQ&oe=61D70B49"
      }],
    }),
  });
}