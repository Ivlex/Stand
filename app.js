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

var a = '';

var b = '';

var onBtn = false;

var blaEui = '';

var allTimeValue1 = 0;

var allTimeValue2 = 0;

var allTimeValue3 = 0;

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
    var findElem = document.getElementById(b);
    findElem.disabled = false;
  }
};

socket.onmessage = function(event)  //реакция на получение нового сообщения в WebSocket
{
  var response = JSON.parse(event.data)

  //если это ответ на запрос списка подключенных устройств
  /*else*/ if(response.cmd == "get_device_appdata_resp")
  {
    var i = 0;

    var eui = "";

    while(response.devices_list[i])
    {
      var type = "unknown";

      if(response.devices_list[i].devName.indexOf("СИ-12") !== -1 && response.devices_list[i].devEui == '303632316E377215')
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

        var out = '<div class="card">' +
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
        b = response.devices_list[i].devEui + "s"

        findElem = document.getElementById(response.devices_list[i].devEui + "s");
        findElem.setAttribute("onclick","clickOnBtn_sendData(this.id.slice(0,-1))");
        findElem.value = "close";

        out = '<div class="card">' +
              '<div class="card-content"> <img id = card3Img src="gif/k0.png" width="20%"/></div>' +
            '</div>'
        document.getElementById('pgcontent').innerHTML += out;

        devicesList[response.devices_list[i].devEui] = dev;


        eui = response.devices_list[i].devEui;
        
        //break;
      }
      i++;
    }
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

  var findElem = document.getElementById(b);
  findElem.disabled = true;
};

socket.onerror = function(error)
{
  alert("Ошибка " + error.message);
};

function clickOnBtn_sendData(pDevEui)  //отправка команды на устройство (пока только на одно 
{                       //устройство, по документации можно сразу на несколько)
  var sendData;
  
  var findElem = document.getElementById(pDevEui+"s");
  var findImg = document.getElementById("card3Img");
  if(findElem.value == "close")
  {
    sendData = "030210";
    findElem.innerHTML = 'Закрыть клапан';
    findImg.src = "gif/k1.gif";
    findElem.value = "open";
    condition = 1;
  }
  else
  {
    sendData = "030110";
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

  socket.send(msg);
}