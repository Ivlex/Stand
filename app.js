var app = new Framework7({
  // App root element
  root: '#app',
  // App Name
  name: 'Стенд',
  // App id
  id: 'com.myapp.test',
  // Enable swipe panel
  panel: {
    swipe: 'left',
  },
  // Add default routes
  routes: [
    {
      path: '/about/',
      url: 'about.html',
    },
  ],
});

var mainView = app.views.create('.view-main');
"use strict";

class Comand
{
  set(cmd)
  {
    this.cmd = cmd;
  }
}

class UserAuth
{
    constructor(login,password)
    {
      this.cmd = "auth_req";
      this.login = login;
      this.password = password;
    }
}

class Device
{
  constructor(devName, type, devEui, countChannels, transPeriod, lat, lon, lastDataTs, lastDataCharge, otherInfo)
  {
    this.devName = name;
    this.type = type;
    this.devEui = devEui;
        this.countChannels = countChannels;
        this.transPeriod = transPeriod;           //Период чего???
        this.lat = lat;                   //Широта
        this.lon = lon;                   //Долгота
        this.lastDataTs = lastDataTs;           //Время последнего получения ответа от устройства
        this.lastDataCharge = lastDataCharge;       //Последняя зарядка что???
        this.otherInfo = otherInfo;             //Дополнительная информация???
        //this.channels=[];
  }
}

var onBtn = false;

var allTimeValue = 0;

var lastBatary = 0;

var lastDate;

var lastTemp = 0;

var devicesList = {};

var socket = new WebSocket("ws://lora.elecom-nt.ru:8002");

var condition = 0;

let userAuth = new UserAuth("arsenyperm", "7469494244");

let comand = new Comand();

comand.set("get_device_appdata_req");

var msg = JSON.stringify(userAuth);

socket.onopen = function()  //реакция на открытие WebSocket
{
  alert("Соединение установлено");
  socket.send(msg);

  msg = JSON.stringify(comand);
  socket.send(msg);

    if(onBtn)
  {
    var findElem = document.getElementById('555');
    findElem.disabled = false;

    var findElem = document.getElementById('777');
    findElem.disabled = false;
  }
};

socket.onmessage = function(event)  //реакция на получение нового сообщения в WebSocket
{
  var response = JSON.parse(event.data)

  //если это автоматически пришедшие данные
  if(response.cmd == "rx")
  {
    //если это наш счетчик воды
    if(response.devEui == "303632316E377215")
    {
      date = parseInt((response.data_list.data.substring(12,14)
      + response.data_list.data.substring(10,12) + response.data_list.data.substring(8,10)
      + response.data_list.data.substring(6,8)),16) * 1000;

      lastDate = date;
      lastBatary = littleEndianToDec(response.data_list.data.substring(2,4));
      lastTemp = littleEndianToDec(response.data_list.data.substring(14,16));

      allTimeValue = allTimeValue +  Number(littleEndianToDec(response.data_list.data.substring(16,24)));//Number(littleEndianToDec(response.data_list.data.substring(24,32))) + Number(littleEndianToDec(response.data_list.data.substring(32,40)));

      /*var find = document.getElementById("info12");
      find.value = "Заряд батареи: " + lastBatary + " \nТемпература: " + lastTemp
      + " \nПоследние показания получены: " + new Date(lastDate);*/
      var find = "Заряд батареи: " + lastBatary + " \nТемпература: " + lastTemp
      + " \nПоследние показания получены: " + new Date(lastDate);
      document.getElementById('card1').innerHTML = find;
    }
    /*alert("Получены данные rx:\nВремя: " + response.ts + "\ndevEui: "             //вывод данных в реальном времени, ЗАКОММЕНЧЕН!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     + response.devEui + "\nДанные: " + response.data);*/
  }

  //если это ответ на запрос пакетов от сервера
  else if(response.cmd == "get_data_resp")//Вопрос: как ограничить? Предыдущее не работает
  {
    var i = 0;
    var dataStr = "";
    var date = 0;
    var archiveType = "";
    var state = "";

    if(onBtn)
    {
      //если это СИ-12, дальше идет разбор всех типов пакетов, кроме архивных
      if(devicesList[response.devEui].type == "СИ-12")
      {
        while(response.data_list[i])
        {
          if(response.data_list[i].data.substring(0,2) == "01")
          {
            date = parseInt((response.data_list[i].data.substring(12,14)
            + response.data_list[i].data.substring(10,12) + response.data_list[i].data.substring(8,10)
            + response.data_list[i].data.substring(6,8)),16) * 1000;

            dataStr = dataStr + "Тип: Регулярный\nЗаряд батареи: " + littleEndianToDec(response.data_list[i].data.substring(2,4))
            + "\nЗначения основных настроек: " + response.data_list[i].data.substring(4,6)
            + "\nВремя: " + new Date(date) + "\nТемпература: "
            + littleEndianToDec(response.data_list[i].data.substring(14,16)) + "\nВход 1: " + littleEndianToDec(response.data_list[i].data.substring(16,24))
            + "\nВход 2: " + littleEndianToDec(response.data_list[i].data.substring(24,32)) + "\nВход 3: "
            + littleEndianToDec(response.data_list[i].data.substring(32,40)) + "\nВход 4: " +
            littleEndianToDec(response.data_list[i].data.substring(40,48)) + "\n" + "\n";

          }
          else if (response.data_list[i].data.substring(0,2) == "02")
          {
            dataStr = dataStr + "Тип: Тревога\nЗаряд батареи: " + littleEndianToDec(response.data_list[i].data.substring(2,4))
            + "\nЗначения основных настроек: " + response.data_list[i].data.substring(4,6)
            + "\nНомер входа, на котором зафиксирована тревога: "
            + littleEndianToDec(response.data_list[i].data.substring(6,8)) + "\nВход 1: " + littleEndianToDec(response.data_list[i].data.substring(8,16))
            + "\nВход 2: " + littleEndianToDec(response.data_list[i].data.substring(16,24)) + "\nВход 3: "
            + littleEndianToDec(response.data_list[i].data.substring(24,32)) + "\nВход 4: " +
            littleEndianToDec(response.data_list[i].data.substring(32,40)) + "\n" + "\n";
          }
          else if (response.data_list[i].data.substring(0,2) == "03")//Архивы не дописаны
          {
            archiveType = response.data_list[i].data.substring(11,12);
            switch(archiveType)
            {
              case "0":
              archiveType = "Почасовой";
              break;
              case "1":
              archiveType = "Посуточный";
              break;
              case "2":
              archiveType = "Помесячный";
              break;
              case "3":
              archiveType = "Температура";
              break;
              default:
              archiveType = "unknown";
              break;
            }

            dataStr = dataStr + "Тип: Архив\nЗаряд батареи: " + littleEndianToDec(response.data_list[i].data.substring(2,4))
            + "\nЗначения основных настроек: " + response.data_list[i].data.substring(4,6)
            + "\nНомер входа, для которого передается архив: "
            + littleEndianToDec(response.data_list[i].data.substring(6,8)) + "\nКоличество записей в архиве: " + littleEndianToDec(response.data_list[i].data.substring(8,10))
            + "\nТип архива: " + archiveType;
          }
          else if (response.data_list[i].data.substring(0,2) == "04")
          {
            state = response.data_list[i].data.substring(7,8);
            switch(state)
            {
              case "0":
              state = "Отключено";
              break;
              case "1":
              state = "Подключено";
              break;
              default:
              state = "unknown";
              break;
            }
            dataStr = dataStr + "Тип: Информация о внешнем питании\nЗаряд батареи: " + littleEndianToDec(response.data_list[i].data.substring(2,4))
            + "\nЗначения основных настроек: " + response.data_list[i].data.substring(4,6)
            + "\nСостояние питания: " + state;
          }
          else if (response.data_list[i].data.substring(0,2) == "05")
          {
            state = response.data_list[i].data.substring(9,10);
            switch(state)
            {
              case "0":
              state = "Разомкнут";
              break;
              case "1":
              state = "Замкнут";
              break;
              default:
              state = "unknown";
              break;
            }
            dataStr = dataStr + "Тип: Информация об изменении состояния выхода\nЗаряд батареи: " + littleEndianToDec(response.data_list[i].data.substring(2,4))
            + "\nЗначения основных настроек: " + response.data_list[i].data.substring(4,6)
            + "\nНомер выхода: " + littleEndianToDec(response.data_list[i].data.substring(6,8)) + "\nСостояние выхода: " + state;
          }

          //если это какой-то другой тип пакетов
          else
            dataStr = dataStr + response.data_list[i].data +'\n';
          i++;

          alert("Получены данные get_data_resp:\n" + dataStr);
          dataStr = '';
        }

      }

      //если это не СИ-12
      else 
      {
        while(response.data_list[i])
          {
            dataStr = dataStr + response.data_list[i].data +'\n'; 
            i++;
          }
          alert("Получены данные get_data_resp:\n" + dataStr);
      }
    }
    else
    {
      var i = 0;

      if(response.data_list[i])
      {
        date = parseInt((response.data_list[i].data.substring(12,14)
        + response.data_list[i].data.substring(10,12) + response.data_list[i].data.substring(8,10)
        + response.data_list[i].data.substring(6,8)),16) * 1000;

        lastDate = date;
        lastBatary = littleEndianToDec(response.data_list[i].data.substring(2,4));
        lastTemp = littleEndianToDec(response.data_list[i].data.substring(14,16));
      }

      while(response.data_list[i])
      {
        if(response.data_list[i].data.substring(0,2) == "01")
        {
          //allTimeValue = allTimeValue + Number(littleEndianToDec(response.data_list[i].data.substring(16,24)));//Number(littleEndianToDec(response.data_list[i].data.substring(24,32))) + Number(littleEndianToDec(response.data_list[i].data.substring(32,40)));
        }
        i++;
      }
      
      var out = "Заряд батареи: " + lastBatary + " \nТемпература: " + lastTemp
      + " \nПоследние показания получены: " + new Date(lastDate);

      out = '<div class="card">' +
              '<div class="card-content card-content-padding id = card1">' + out + '</div>' +
            '</div>'
      document.getElementById('pgcontent').innerHTML += out;

      onBtn = true;
    }
  }

  //если это ответ на запрос списка подключенных устройств
  else if(response.cmd == "get_device_appdata_resp")
  {
    var i = 0;

    var eui = "";

    while(response.devices_list[i])
    {
      var type = "unknown";
      if(response.devices_list[i].devName.indexOf("СИ-12") !== -1)
      {
        type = "СИ-12";
        var countChannels = "unknown";
        var transPeriod = "unknown";
        var lat = "unknown";
        var lon = "unknown";
        var lastDataTs = "" + response.devices_list[i].last_data_ts;
        var lastDataCharge = "unknown";
        var otherInfo = "";
        var dev = new Device(response.devices_list[i].devName,type, response.devices_list[i].devEui, countChannels, transPeriod, lat, lon, lastDataTs, lastDataCharge, otherInfo);

        var out = response.devices_list[i].devEui + "g";
        out = '<div class="block">' +
                '<div class="row">' +
                  '<button class="col button button-fill" style="width:360px" id = "' + out + '">Запросить 5 последних пакетов</button>' +
                '</div>' +
              '</div>'
        document.getElementById('pgcontent').innerHTML += out;

        var findElem = document.getElementById(response.devices_list[i].devEui + "g");
        findElem.setAttribute("onclick","clickOnBtn_getData(this.id.slice(0,-1))");


        out = '<div class="card">' +
              '<div class="card-content card-content-padding id = card2">Кнопка, открывающая/закрывающая клапан</div>' +
            '</div>'
        document.getElementById('pgcontent').innerHTML += out;

        out = response.devices_list[i].devEui + "s";
        out = '<div class="block">' +
                '<div class="row">' +
                  '<button class="col button button-fill" style="width:360px" id = "' + out + '">Открыть клапан</button>' +
                '</div>' +
              '</div>'
        document.getElementById('pgcontent').innerHTML += out;

        findElem = document.getElementById(response.devices_list[i].devEui + "s");
        findElem.setAttribute("onclick","clickOnBtn_sendData(this.id.slice(0,-1))");
        findElem.value = "close";

        out = '<div class="card">' +
              '<div class="card-content"> <img id = card3Img src="gif/k0.png" width="15%"/></div>' +
            '</div>'
        document.getElementById('pgcontent').innerHTML += out;

        devicesList[response.devices_list[i].devEui] = dev;

        eui = response.devices_list[i].devEui;

        break;
      }
      i++;
    }

    /*var textElem = document.createElement("p");
    textElem.innerHTML = "Информация об устройстве";
    document.body.appendChild(textElem);*/

    //запрос всех существующих данных
    var getDataCmd = {
    cmd: "get_data_req",
    devEui: eui,
    select: {
        date_from: 0
      }
    };
    msg = JSON.stringify(getDataCmd);
    socket.send(msg);
  }
};

socket.onclose = function(event)  //обработка закрытия Websocket
{
  if (event.wasClean) {
    alert('Соединение закрыто чисто');
  } else {
    alert('Обрыв соединения'); // например, "убит" процесс сервера
  }
  alert('Код: ' + event.code + ' причина: ' + event.reason);

  //блокировка кнопок
  var findElem = document.getElementById('555');
  findElem.disabled = true;

  var findElem = document.getElementById('777');
  findElem.disabled = true;
};

socket.onerror = function(error)
{
  alert("Ошибка " + error.message);
};

function clickOnBtn_getData(pDevEui)  //получение последних пяти данных с сервера
{
  var getDataCmd = {
    cmd: "get_data_req",
    devEui: pDevEui,
    select: {
      limit: 5
      /*date_from: 1531278000000,
      date_to: 1531296000000*/
    }
  };
  msg = JSON.stringify(getDataCmd);

  socket.send(msg);
}

function clickOnBtn_sendData(pDevEui)  //отправка команды на устройство (пока только на одно 
{                       //устройство, по документации можно сразу на несколько)
  var sendData;
  
  var findElem = document.getElementById(pDevEui+"s");
  var findImg = document.getElementById("card3Img");
  if(findElem.value == "close")
  {
    sendData = "030205";
    findElem.innerHTML = 'Закрыть клапан';
    findImg.src = "gif/k1.gif";
    findElem.value = "open";
    condition = 1;
  }
  else
  {
    sendData = "030105";
    findElem.innerHTML = 'Открыть клапан';
    findImg.src = "gif/k0.png";
    findElem.value = "close";
    condition = 0;
  }

  var sendDataCmd = {
    cmd: "send_data_req",
    data_list: [             //вот тут есть расхождение с документацией, можно отсылать сразу нескольким
    {
      devEui: pDevEui,        //стоит добавить преобразование/проверку на строку
      data: sendData,
      ack: false,
      port: 2
    }]
  };
  msg = JSON.stringify(sendDataCmd);

  socket.send(msg);                     //ОТСЫЛКА ДАННЫХ ЗАКОММЕНЧЕНА!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

function stringToLittleEndian(str)  //перевод строки в littleEndian
{
  var hex = '';
  for(var i = 0; i<str.length;i++)
  {
    hex = str.charCodeAt(i).toString(16) + hex;
  }
  return hex;
}

function littleEndianToString(hex)
{
  var tmp = '';
  var str = '';
  for(var i = 0; i<hex.length;i=i+2)
  {
    tmp = hex.substring(i,i+2);
    tmp = String.fromCharCode(parseInt(tmp,16));
    str = tmp + str;
  }
  return str;
}

function stringToHex(str) //перевод строки в littleEndian
{
  var hex = '';
  for(var i = 0; i<str.length;i++)
  {
    hex = hex + str.charCodeAt(i).toString(16);
  }
  hex += "0d0a";
  return hex;
}

function hexToString(hex)
{
  var tmp = '';
  var str = '';
  for(var i = 0; i<hex.length;i=i+2)
  {
    tmp = hex.substring(i,i+2);
    tmp = String.fromCharCode(parseInt(tmp,16));
    str += tmp;
  }
  return str;
}

function littleEndianToDec(hex)
{
  var tmp = '';
  var str = 0;
  for(var i = 0; i<hex.length;i=i+2)
  {
    tmp = hex.substring(i,i+2);
    tmp = ''+parseInt(tmp,16)*Math.pow(16,i);
    str = Number(tmp) + str;
  }
  return ""+str;
}