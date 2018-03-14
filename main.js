(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ArkMainDialog, eventManager, eventNames;

eventManager = require('../event/ArkEventManager.coffee');

eventNames = require('../event/ArkEventNames.coffee');

ArkMainDialog = (function() {
  function ArkMainDialog() {}

  ArkMainDialog.prototype.onClose = function() {
    return console.log("hello world");
  };

  cc.BuilderReader.registerController("ArkMainDialog", new ArkMainDialog());

  return ArkMainDialog;

})();

module.exports = cc.BuilderReader.load("res/main.ccbi");


},{"../event/ArkEventManager.coffee":3,"../event/ArkEventNames.coffee":4}],2:[function(require,module,exports){
var GameLogic, UserData, eventManager, eventNames, sceneManager;

sceneManager = require('../tools/ArkSceneManager.coffee');

eventManager = require('../event/ArkEventManager.coffee');

eventNames = require('../event/ArkEventNames.coffee');

UserData = require('../model/ArkUserData.coffee');

GameLogic = (function() {
  function GameLogic() {}

  GameLogic.prototype.init = function() {
    this._userData = new UserData();
    return this._registerEvents();
  };

  GameLogic.prototype._registerEvents = function() {
    eventManager.listen(eventNames.GAME_START, (function(_this) {
      return function() {
        _this._userData.setScore(0);
        _this._userData.setCount(20);
        return _this._GameStart();
      };
    })(this));
    eventManager.listen(eventNames.GAME_END, (function(_this) {
      return function() {
        var dialogNode;
        sceneManager.removeTopLayer();
        dialogNode = GameEndDialog.showDialog();
        sceneManager.addLayerToScene(dialogNode);
        return dialogNode.controller.init(_this._userData.getScore());
      };
    })(this));
    return eventManager.listen(eventNames.GAME_NEXT_LEVEL, (function(_this) {
      return function() {
        sceneManager.removeTopLayer();
        _this._userData.setCount(20);
        return _this._GameStart();
      };
    })(this));
  };

  GameLogic.prototype._GameStart = function() {
    var dialogNode;
    dialogNode = GameDialog.showDialog();
    sceneManager.addLayerToScene(dialogNode);
    return dialogNode.controller.init(this._userData);
  };

  return GameLogic;

})();

module.exports = GameLogic;


},{"../event/ArkEventManager.coffee":3,"../event/ArkEventNames.coffee":4,"../model/ArkUserData.coffee":6,"../tools/ArkSceneManager.coffee":7}],3:[function(require,module,exports){
var EventManager;

EventManager = {
  send: function(eventName, data) {
    var event;
    event = new cc.EventCustom(eventName);
    if (data !== null) {
      event.setUserData(data);
    }
    return cc.eventManager.dispatchEvent(event);
  },
  listen: function(eventName, listenFunc, nodeOrPriority) {
    var ccListener;
    if (nodeOrPriority == null) {
      nodeOrPriority = 1;
    }
    ccListener = cc.EventListener.create({
      event: cc.EventListener.CUSTOM,
      eventName: eventName,
      callback: function(event) {
        return listenFunc(event.getUserData(), event);
      }
    });
    return cc.eventManager.addListener(ccListener, nodeOrPriority);
  }
};

module.exports = EventManager;


},{}],4:[function(require,module,exports){
var EventNames;

EventNames = {
  GAME_START: "game.start",
  GAME_END: "game.end",
  GAME_NEXT_LEVEL: "game.next.level"
};

module.exports = EventNames;


},{}],5:[function(require,module,exports){
cc.game.onStart = function() {
  var GameLogic, gameDialog, gameLogicObj, sceneManager;
  cc.view.adjustViewPort(true);
  cc.view.setDesignResolutionSize(1136, 640, cc.ResolutionPolicy.SHOW_ALL);
  cc.view.resizeWithBrowserSize(true);
  cc.BuilderReader.setResourcePath("res/");
  sceneManager = require("./tools/ArkSceneManager.coffee");
  sceneManager.init();
  gameDialog = require('./ccbView/ArkMainDialog.coffee');
  sceneManager.addLayerToScene(gameDialog);
  GameLogic = require('./control/ArkGameLogic.coffee');
  gameLogicObj = new GameLogic();
  return gameLogicObj.init();
};

cc.game.run();


},{"./ccbView/ArkMainDialog.coffee":1,"./control/ArkGameLogic.coffee":2,"./tools/ArkSceneManager.coffee":7}],6:[function(require,module,exports){
var UserData;

UserData = (function() {
  function UserData() {
    this._score = 0;
    this._count = 0;
  }

  UserData.prototype.setScore = function(_score) {
    this._score = _score;
  };

  UserData.prototype.getScore = function() {
    return this._score;
  };

  UserData.prototype.setCount = function(_count) {
    this._count = _count;
  };

  UserData.prototype.getCount = function() {
    return this._count;
  };

  return UserData;

})();

module.exports = UserData;


},{}],7:[function(require,module,exports){
var LayerManager, Loader;

LayerManager = {
  init: function() {
    this.layerStack = [];
    this.scene = new cc.Scene();
    return cc.director.runScene(this.scene);
  },
  clearLayer: function() {
    this.scene.removeAllChildren();
    return this.layerStack.length = 0;
  },
  addLayerToScene: function(ccbLayer, zOrder) {
    var layout, node;
    if (zOrder == null) {
      zOrder = 0;
    }
    layout = new ccui.Layout();
    layout.setContentSize(cc.size(1136, 640));
    layout.setTouchEnabled(true);
    node = new cc.Node();
    node.addChild(layout);
    node.addChild(ccbLayer);
    this.scene.addChild(node, zOrder);
    return this.layerStack.push(node);
  },
  removeTopLayer: function() {
    var topLayer;
    topLayer = this.layerStack.pop();
    return this.scene.removeChild(topLayer, true);
  }
};

Loader = (function() {
  function Loader(ccbFile1, controllerName1) {
    this.ccbFile = ccbFile1;
    this.controllerName = controllerName1;
  }

  Loader.prototype.showDialog = function() {
    return cc.BuilderReader.load(this.ccbFile);
  };

  return Loader;

})();

LayerManager.defineDialog = function(ccbFile, controllerName, controllerClass) {
  cc.BuilderReader.registerController(controllerName, new controllerClass());
  return new Loader(ccbFile, controllerName);
};

module.exports = LayerManager;


},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2NiVmlldy9BcmtNYWluRGlhbG9nLmNvZmZlZSIsInNyYy9jb250cm9sL0Fya0dhbWVMb2dpYy5jb2ZmZWUiLCJzcmMvZXZlbnQvQXJrRXZlbnRNYW5hZ2VyLmNvZmZlZSIsInNyYy9ldmVudC9BcmtFdmVudE5hbWVzLmNvZmZlZSIsInNyYy9tYWluLmNvZmZlZSIsInNyYy9tb2RlbC9BcmtVc2VyRGF0YS5jb2ZmZWUiLCJzcmMvdG9vbHMvQXJrU2NlbmVNYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEFya01haW5EaWFsb2csIGV2ZW50TWFuYWdlciwgZXZlbnROYW1lcztcblxuZXZlbnRNYW5hZ2VyID0gcmVxdWlyZSgnLi4vZXZlbnQvQXJrRXZlbnRNYW5hZ2VyLmNvZmZlZScpO1xuXG5ldmVudE5hbWVzID0gcmVxdWlyZSgnLi4vZXZlbnQvQXJrRXZlbnROYW1lcy5jb2ZmZWUnKTtcblxuQXJrTWFpbkRpYWxvZyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gQXJrTWFpbkRpYWxvZygpIHt9XG5cbiAgQXJrTWFpbkRpYWxvZy5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb25zb2xlLmxvZyhcImhlbGxvIHdvcmxkXCIpO1xuICB9O1xuXG4gIGNjLkJ1aWxkZXJSZWFkZXIucmVnaXN0ZXJDb250cm9sbGVyKFwiQXJrTWFpbkRpYWxvZ1wiLCBuZXcgQXJrTWFpbkRpYWxvZygpKTtcblxuICByZXR1cm4gQXJrTWFpbkRpYWxvZztcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYy5CdWlsZGVyUmVhZGVyLmxvYWQoXCJyZXMvbWFpbi5jY2JpXCIpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwxVnpaWEp6TDNSaGIzZDFMM04wZFdSNUwwRnlhMkZrTDBGeWEyRmtSMkZ0WlM5emNtTXZZMk5pVm1sbGR5OUJjbXROWVdsdVJHbGhiRzluTG1OdlptWmxaU0lzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk5VmMyVnljeTkwWVc5M2RTOXpkSFZrZVM5QmNtdGhaQzlCY210aFpFZGhiV1V2YzNKakwyTmpZbFpwWlhjdlFYSnJUV0ZwYmtScFlXeHZaeTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzU1VGQlFUczdRVUZCUVN4WlFVRkJMRWRCUVdVc1QwRkJRU3hEUVVGUkxHbERRVUZTT3p0QlFVTm1MRlZCUVVFc1IwRkJZU3hQUVVGQkxFTkJRVkVzSzBKQlFWSTdPMEZCUTFBN096c3dRa0ZEUml4UFFVRkJMRWRCUVZNc1UwRkJRVHRYUVVOTUxFOUJRVThzUTBGQlF5eEhRVUZTTEVOQlFWa3NZVUZCV2p0RlFVUkxPenRGUVVkVUxFVkJRVVVzUTBGQlF5eGhRVUZoTEVOQlFVTXNhMEpCUVdwQ0xFTkJRMFVzWlVGRVJpeEZRVVZGTEVsQlFVa3NZVUZCU2l4RFFVRkJMRU5CUmtZN096czdPenRCUVV0S0xFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENMRVZCUVVVc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQmFrSXNRMEZCYzBJc1pVRkJkRUlpZlE9PVxuIiwidmFyIEdhbWVMb2dpYywgVXNlckRhdGEsIGV2ZW50TWFuYWdlciwgZXZlbnROYW1lcywgc2NlbmVNYW5hZ2VyO1xuXG5zY2VuZU1hbmFnZXIgPSByZXF1aXJlKCcuLi90b29scy9BcmtTY2VuZU1hbmFnZXIuY29mZmVlJyk7XG5cbmV2ZW50TWFuYWdlciA9IHJlcXVpcmUoJy4uL2V2ZW50L0Fya0V2ZW50TWFuYWdlci5jb2ZmZWUnKTtcblxuZXZlbnROYW1lcyA9IHJlcXVpcmUoJy4uL2V2ZW50L0Fya0V2ZW50TmFtZXMuY29mZmVlJyk7XG5cblVzZXJEYXRhID0gcmVxdWlyZSgnLi4vbW9kZWwvQXJrVXNlckRhdGEuY29mZmVlJyk7XG5cbkdhbWVMb2dpYyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gR2FtZUxvZ2ljKCkge31cblxuICBHYW1lTG9naWMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91c2VyRGF0YSA9IG5ldyBVc2VyRGF0YSgpO1xuICAgIHJldHVybiB0aGlzLl9yZWdpc3RlckV2ZW50cygpO1xuICB9O1xuXG4gIEdhbWVMb2dpYy5wcm90b3R5cGUuX3JlZ2lzdGVyRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgZXZlbnRNYW5hZ2VyLmxpc3RlbihldmVudE5hbWVzLkdBTUVfU1RBUlQsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5fdXNlckRhdGEuc2V0U2NvcmUoMCk7XG4gICAgICAgIF90aGlzLl91c2VyRGF0YS5zZXRDb3VudCgyMCk7XG4gICAgICAgIHJldHVybiBfdGhpcy5fR2FtZVN0YXJ0KCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICBldmVudE1hbmFnZXIubGlzdGVuKGV2ZW50TmFtZXMuR0FNRV9FTkQsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGlhbG9nTm9kZTtcbiAgICAgICAgc2NlbmVNYW5hZ2VyLnJlbW92ZVRvcExheWVyKCk7XG4gICAgICAgIGRpYWxvZ05vZGUgPSBHYW1lRW5kRGlhbG9nLnNob3dEaWFsb2coKTtcbiAgICAgICAgc2NlbmVNYW5hZ2VyLmFkZExheWVyVG9TY2VuZShkaWFsb2dOb2RlKTtcbiAgICAgICAgcmV0dXJuIGRpYWxvZ05vZGUuY29udHJvbGxlci5pbml0KF90aGlzLl91c2VyRGF0YS5nZXRTY29yZSgpKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBldmVudE1hbmFnZXIubGlzdGVuKGV2ZW50TmFtZXMuR0FNRV9ORVhUX0xFVkVMLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2NlbmVNYW5hZ2VyLnJlbW92ZVRvcExheWVyKCk7XG4gICAgICAgIF90aGlzLl91c2VyRGF0YS5zZXRDb3VudCgyMCk7XG4gICAgICAgIHJldHVybiBfdGhpcy5fR2FtZVN0YXJ0KCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBHYW1lTG9naWMucHJvdG90eXBlLl9HYW1lU3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGlhbG9nTm9kZTtcbiAgICBkaWFsb2dOb2RlID0gR2FtZURpYWxvZy5zaG93RGlhbG9nKCk7XG4gICAgc2NlbmVNYW5hZ2VyLmFkZExheWVyVG9TY2VuZShkaWFsb2dOb2RlKTtcbiAgICByZXR1cm4gZGlhbG9nTm9kZS5jb250cm9sbGVyLmluaXQodGhpcy5fdXNlckRhdGEpO1xuICB9O1xuXG4gIHJldHVybiBHYW1lTG9naWM7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZUxvZ2ljO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwxVnpaWEp6TDNSaGIzZDFMM04wZFdSNUwwRnlhMkZrTDBGeWEyRmtSMkZ0WlM5emNtTXZZMjl1ZEhKdmJDOUJjbXRIWVcxbFRHOW5hV011WTI5bVptVmxJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTDFWelpYSnpMM1JoYjNkMUwzTjBkV1I1TDBGeWEyRmtMMEZ5YTJGa1IyRnRaUzl6Y21NdlkyOXVkSEp2YkM5QmNtdEhZVzFsVEc5bmFXTXVZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRWxCUVVFN08wRkJRVUVzV1VGQlFTeEhRVUZyUWl4UFFVRkJMRU5CUVZFc2FVTkJRVkk3TzBGQlEyeENMRmxCUVVFc1IwRkJhMElzVDBGQlFTeERRVUZSTEdsRFFVRlNPenRCUVVOc1FpeFZRVUZCTEVkQlFXdENMRTlCUVVFc1EwRkJVU3dyUWtGQlVqczdRVUZEYkVJc1VVRkJRU3hIUVVGclFpeFBRVUZCTEVOQlFWRXNOa0pCUVZJN08wRkJSMW83T3p0elFrRkRSaXhKUVVGQkxFZEJRVTBzVTBGQlFUdEpRVU5HTEVsQlFVTXNRMEZCUVN4VFFVRkVMRWRCUVdFc1NVRkJTU3hSUVVGS0xFTkJRVUU3VjBGRFlpeEpRVUZETEVOQlFVRXNaVUZCUkN4RFFVRkJPMFZCUmtVN08zTkNRVWxPTEdWQlFVRXNSMEZCYVVJc1UwRkJRVHRKUVVOaUxGbEJRVmtzUTBGQlF5eE5RVUZpTEVOQlFXOUNMRlZCUVZVc1EwRkJReXhWUVVFdlFpeEZRVUV5UXl4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVUU3VVVGRGRrTXNTMEZCUXl4RFFVRkJMRk5CUVZNc1EwRkJReXhSUVVGWUxFTkJRVzlDTEVOQlFYQkNPMUZCUTBFc1MwRkJReXhEUVVGQkxGTkJRVk1zUTBGQlF5eFJRVUZZTEVOQlFXOUNMRVZCUVhCQ08yVkJRMEVzUzBGQlF5eERRVUZCTEZWQlFVUXNRMEZCUVR0TlFVaDFRenRKUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNRMEZCTTBNN1NVRk5RU3haUVVGWkxFTkJRVU1zVFVGQllpeERRVUZ2UWl4VlFVRlZMRU5CUVVNc1VVRkJMMElzUlVGQmVVTXNRMEZCUVN4VFFVRkJMRXRCUVVFN1lVRkJRU3hUUVVGQk8wRkJRM0pETEZsQlFVRTdVVUZCUVN4WlFVRlpMRU5CUVVNc1kwRkJZaXhEUVVGQk8xRkJRMEVzVlVGQlFTeEhRVUZoTEdGQlFXRXNRMEZCUXl4VlFVRmtMRU5CUVVFN1VVRkRZaXhaUVVGWkxFTkJRVU1zWlVGQllpeERRVUUyUWl4VlFVRTNRanRsUVVOQkxGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCZEVJc1EwRkJNa0lzUzBGQlF5eERRVUZCTEZOQlFWTXNRMEZCUXl4UlFVRllMRU5CUVVFc1EwRkJNMEk3VFVGS2NVTTdTVUZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRU3hKUVVGQkxFTkJRWHBETzFkQlQwRXNXVUZCV1N4RFFVRkRMRTFCUVdJc1EwRkJiMElzVlVGQlZTeERRVUZETEdWQlFTOUNMRVZCUVdkRUxFTkJRVUVzVTBGQlFTeExRVUZCTzJGQlFVRXNVMEZCUVR0UlFVTTFReXhaUVVGWkxFTkJRVU1zWTBGQllpeERRVUZCTzFGQlEwRXNTMEZCUXl4RFFVRkJMRk5CUVZNc1EwRkJReXhSUVVGWUxFTkJRVzlDTEVWQlFYQkNPMlZCUTBFc1MwRkJReXhEUVVGQkxGVkJRVVFzUTBGQlFUdE5RVWcwUXp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQmFFUTdSVUZrWVRzN2MwSkJjVUpxUWl4VlFVRkJMRWRCUVZrc1UwRkJRVHRCUVVOU0xGRkJRVUU3U1VGQlFTeFZRVUZCTEVkQlFXRXNWVUZCVlN4RFFVRkRMRlZCUVZnc1EwRkJRVHRKUVVOaUxGbEJRVmtzUTBGQlF5eGxRVUZpTEVOQlFUWkNMRlZCUVRkQ08xZEJRMEVzVlVGQlZTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRjBRaXhEUVVFeVFpeEpRVUZETEVOQlFVRXNVMEZCTlVJN1JVRklVVHM3T3pzN08wRkJUV2hDTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBFdmVudE1hbmFnZXI7XG5cbkV2ZW50TWFuYWdlciA9IHtcbiAgc2VuZDogZnVuY3Rpb24oZXZlbnROYW1lLCBkYXRhKSB7XG4gICAgdmFyIGV2ZW50O1xuICAgIGV2ZW50ID0gbmV3IGNjLkV2ZW50Q3VzdG9tKGV2ZW50TmFtZSk7XG4gICAgaWYgKGRhdGEgIT09IG51bGwpIHtcbiAgICAgIGV2ZW50LnNldFVzZXJEYXRhKGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gY2MuZXZlbnRNYW5hZ2VyLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICB9LFxuICBsaXN0ZW46IGZ1bmN0aW9uKGV2ZW50TmFtZSwgbGlzdGVuRnVuYywgbm9kZU9yUHJpb3JpdHkpIHtcbiAgICB2YXIgY2NMaXN0ZW5lcjtcbiAgICBpZiAobm9kZU9yUHJpb3JpdHkgPT0gbnVsbCkge1xuICAgICAgbm9kZU9yUHJpb3JpdHkgPSAxO1xuICAgIH1cbiAgICBjY0xpc3RlbmVyID0gY2MuRXZlbnRMaXN0ZW5lci5jcmVhdGUoe1xuICAgICAgZXZlbnQ6IGNjLkV2ZW50TGlzdGVuZXIuQ1VTVE9NLFxuICAgICAgZXZlbnROYW1lOiBldmVudE5hbWUsXG4gICAgICBjYWxsYmFjazogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbkZ1bmMoZXZlbnQuZ2V0VXNlckRhdGEoKSwgZXZlbnQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjYy5ldmVudE1hbmFnZXIuYWRkTGlzdGVuZXIoY2NMaXN0ZW5lciwgbm9kZU9yUHJpb3JpdHkpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50TWFuYWdlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lMMVZ6WlhKekwzUmhiM2QxTDNOMGRXUjVMMEZ5YTJGa0wwRnlhMkZrUjJGdFpTOXpjbU12WlhabGJuUXZRWEpyUlhabGJuUk5ZVzVoWjJWeUxtTnZabVpsWlNJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpOVZjMlZ5Y3k5MFlXOTNkUzl6ZEhWa2VTOUJjbXRoWkM5QmNtdGhaRWRoYldVdmMzSmpMMlYyWlc1MEwwRnlhMFYyWlc1MFRXRnVZV2RsY2k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1NVRkJRVHM3UVVGQlFTeFpRVUZCTEVkQlEwazdSVUZCUVN4SlFVRkJMRVZCUVUwc1UwRkJReXhUUVVGRUxFVkJRVmtzU1VGQldqdEJRVU5HTEZGQlFVRTdTVUZCUVN4TFFVRkJMRWRCUVZFc1NVRkJTU3hGUVVGRkxFTkJRVU1zVjBGQlVDeERRVUZ0UWl4VFFVRnVRanRKUVVOU0xFbEJRVWtzU1VGQlFTeExRVUZSTEVsQlFWbzdUVUZEU1N4TFFVRkxMRU5CUVVNc1YwRkJUaXhEUVVGclFpeEpRVUZzUWl4RlFVUktPenRYUVVWQkxFVkJRVVVzUTBGQlF5eFpRVUZaTEVOQlFVTXNZVUZCYUVJc1EwRkJPRUlzUzBGQk9VSTdSVUZLUlN4RFFVRk9PMFZCUzBFc1RVRkJRU3hGUVVGUkxGTkJRVU1zVTBGQlJDeEZRVUZaTEZWQlFWb3NSVUZCZDBJc1kwRkJlRUk3UVVGRFNpeFJRVUZCT3p0TlFVRkJMR2xDUVVGclFqczdTVUZEYkVJc1ZVRkJRU3hIUVVGaExFVkJRVVVzUTBGQlF5eGhRVUZoTEVOQlFVTXNUVUZCYWtJc1EwRkRWRHROUVVGQkxFdEJRVUVzUlVGQlR5eEZRVUZGTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVhoQ08wMUJRMEVzVTBGQlFTeEZRVUZYTEZOQlJGZzdUVUZGUVN4UlFVRkJMRVZCUVZVc1UwRkJReXhMUVVGRU8wRkJRMDRzWlVGQlR5eFZRVUZCTEVOQlFWY3NTMEZCU3l4RFFVRkRMRmRCUVU0c1EwRkJRU3hEUVVGWUxFVkJRV2RETEV0QlFXaERPMDFCUkVRc1EwRkdWanRMUVVSVE8xZEJUV0lzUlVGQlJTeERRVUZETEZsQlFWa3NRMEZCUXl4WFFVRm9RaXhEUVVFMFFpeFZRVUUxUWl4RlFVRjNReXhqUVVGNFF6dEZRVkpKTEVOQlRGSTdPenRCUVdOS0xFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgRXZlbnROYW1lcztcblxuRXZlbnROYW1lcyA9IHtcbiAgR0FNRV9TVEFSVDogXCJnYW1lLnN0YXJ0XCIsXG4gIEdBTUVfRU5EOiBcImdhbWUuZW5kXCIsXG4gIEdBTUVfTkVYVF9MRVZFTDogXCJnYW1lLm5leHQubGV2ZWxcIlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudE5hbWVzO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwxVnpaWEp6TDNSaGIzZDFMM04wZFdSNUwwRnlhMkZrTDBGeWEyRmtSMkZ0WlM5emNtTXZaWFpsYm5RdlFYSnJSWFpsYm5ST1lXMWxjeTVqYjJabVpXVWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl2VlhObGNuTXZkR0Z2ZDNVdmMzUjFaSGt2UVhKcllXUXZRWEpyWVdSSFlXMWxMM055WXk5bGRtVnVkQzlCY210RmRtVnVkRTVoYldWekxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRkJMRlZCUVVFc1IwRkRTVHRGUVVGQkxGVkJRVUVzUlVGQmEwSXNXVUZCYkVJN1JVRkRRU3hSUVVGQkxFVkJRV3RDTEZWQlJHeENPMFZCUlVFc1pVRkJRU3hGUVVGclFpeHBRa0ZHYkVJN096dEJRVWxLTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsImNjLmdhbWUub25TdGFydCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgR2FtZUxvZ2ljLCBnYW1lRGlhbG9nLCBnYW1lTG9naWNPYmosIHNjZW5lTWFuYWdlcjtcbiAgY2Mudmlldy5hZGp1c3RWaWV3UG9ydCh0cnVlKTtcbiAgY2Mudmlldy5zZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgxMTM2LCA2NDAsIGNjLlJlc29sdXRpb25Qb2xpY3kuU0hPV19BTEwpO1xuICBjYy52aWV3LnJlc2l6ZVdpdGhCcm93c2VyU2l6ZSh0cnVlKTtcbiAgY2MuQnVpbGRlclJlYWRlci5zZXRSZXNvdXJjZVBhdGgoXCJyZXMvXCIpO1xuICBzY2VuZU1hbmFnZXIgPSByZXF1aXJlKFwiLi90b29scy9BcmtTY2VuZU1hbmFnZXIuY29mZmVlXCIpO1xuICBzY2VuZU1hbmFnZXIuaW5pdCgpO1xuICBnYW1lRGlhbG9nID0gcmVxdWlyZSgnLi9jY2JWaWV3L0Fya01haW5EaWFsb2cuY29mZmVlJyk7XG4gIHNjZW5lTWFuYWdlci5hZGRMYXllclRvU2NlbmUoZ2FtZURpYWxvZyk7XG4gIEdhbWVMb2dpYyA9IHJlcXVpcmUoJy4vY29udHJvbC9BcmtHYW1lTG9naWMuY29mZmVlJyk7XG4gIGdhbWVMb2dpY09iaiA9IG5ldyBHYW1lTG9naWMoKTtcbiAgcmV0dXJuIGdhbWVMb2dpY09iai5pbml0KCk7XG59O1xuXG5jYy5nYW1lLnJ1bigpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwxVnpaWEp6TDNSaGIzZDFMM04wZFdSNUwwRnlhMkZrTDBGeWEyRmtSMkZ0WlM5emNtTXZiV0ZwYmk1amIyWm1aV1VpTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdlZYTmxjbk12ZEdGdmQzVXZjM1IxWkhrdlFYSnJZV1F2UVhKcllXUkhZVzFsTDNOeVl5OXRZV2x1TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4RlFVRkZMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVklzUjBGQmEwSXNVMEZCUVR0QlFVTmtMRTFCUVVFN1JVRkJRU3hGUVVGRkxFTkJRVU1zU1VGQlNTeERRVUZETEdOQlFWSXNRMEZCZFVJc1NVRkJka0k3UlVGRFFTeEZRVUZGTEVOQlFVTXNTVUZCU1N4RFFVRkRMSFZDUVVGU0xFTkJRV2RETEVsQlFXaERMRVZCUVhORExFZEJRWFJETEVWQlFUSkRMRVZCUVVVc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4UlFVRXZSRHRGUVVOQkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVOQlFVTXNjVUpCUVZJc1EwRkJPRUlzU1VGQk9VSTdSVUZEUVN4RlFVRkZMRU5CUVVNc1lVRkJZU3hEUVVGRExHVkJRV3BDTEVOQlFXbERMRTFCUVdwRE8wVkJSVUVzV1VGQlFTeEhRVUZsTEU5QlFVRXNRMEZCVVN4blEwRkJVanRGUVVObUxGbEJRVmtzUTBGQlF5eEpRVUZpTEVOQlFVRTdSVUZGUVN4VlFVRkJMRWRCUVdFc1QwRkJRU3hEUVVGUkxHZERRVUZTTzBWQlEySXNXVUZCV1N4RFFVRkRMR1ZCUVdJc1EwRkJOa0lzVlVGQk4wSTdSVUZGUVN4VFFVRkJMRWRCUVZrc1QwRkJRU3hEUVVGUkxDdENRVUZTTzBWQlExb3NXVUZCUVN4SFFVRmxMRWxCUVVrc1UwRkJTaXhEUVVGQk8xTkJRMllzV1VGQldTeERRVUZETEVsQlFXSXNRMEZCUVR0QlFXUmpPenRCUVdkQ2JFSXNSVUZCUlN4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGU0xFTkJRVUVpZlE9PVxuIiwidmFyIFVzZXJEYXRhO1xuXG5Vc2VyRGF0YSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gVXNlckRhdGEoKSB7XG4gICAgdGhpcy5fc2NvcmUgPSAwO1xuICAgIHRoaXMuX2NvdW50ID0gMDtcbiAgfVxuXG4gIFVzZXJEYXRhLnByb3RvdHlwZS5zZXRTY29yZSA9IGZ1bmN0aW9uKF9zY29yZSkge1xuICAgIHRoaXMuX3Njb3JlID0gX3Njb3JlO1xuICB9O1xuXG4gIFVzZXJEYXRhLnByb3RvdHlwZS5nZXRTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9zY29yZTtcbiAgfTtcblxuICBVc2VyRGF0YS5wcm90b3R5cGUuc2V0Q291bnQgPSBmdW5jdGlvbihfY291bnQpIHtcbiAgICB0aGlzLl9jb3VudCA9IF9jb3VudDtcbiAgfTtcblxuICBVc2VyRGF0YS5wcm90b3R5cGUuZ2V0Q291bnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY291bnQ7XG4gIH07XG5cbiAgcmV0dXJuIFVzZXJEYXRhO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJEYXRhO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwxVnpaWEp6TDNSaGIzZDFMM04wZFdSNUwwRnlhMkZrTDBGeWEyRmtSMkZ0WlM5emNtTXZiVzlrWld3dlFYSnJWWE5sY2tSaGRHRXVZMjltWm1WbElpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMMVZ6WlhKekwzUmhiM2QxTDNOMGRXUjVMMEZ5YTJGa0wwRnlhMkZrUjJGdFpTOXpjbU12Ylc5a1pXd3ZRWEpyVlhObGNrUmhkR0V1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEVsQlFVRTdPMEZCUVUwN1JVRkRWeXhyUWtGQlFUdEpRVU5VTEVsQlFVTXNRMEZCUVN4TlFVRkVMRWRCUVZVN1NVRkRWaXhKUVVGRExFTkJRVUVzVFVGQlJDeEhRVUZWTzBWQlJrUTdPM0ZDUVVsaUxGRkJRVUVzUjBGQlZTeFRRVUZETEUxQlFVUTdTVUZCUXl4SlFVRkRMRU5CUVVFc1UwRkJSRHRGUVVGRU96dHhRa0ZGVml4UlFVRkJMRWRCUVZVc1UwRkJRVHRYUVVGSExFbEJRVU1zUTBGQlFUdEZRVUZLT3p0eFFrRkZWaXhSUVVGQkxFZEJRVlVzVTBGQlF5eE5RVUZFTzBsQlFVTXNTVUZCUXl4RFFVRkJMRk5CUVVRN1JVRkJSRHM3Y1VKQlJWWXNVVUZCUVN4SFFVRlZMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUU3UlVGQlNqczdPenM3TzBGQlJXUXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyIExheWVyTWFuYWdlciwgTG9hZGVyO1xuXG5MYXllck1hbmFnZXIgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubGF5ZXJTdGFjayA9IFtdO1xuICAgIHRoaXMuc2NlbmUgPSBuZXcgY2MuU2NlbmUoKTtcbiAgICByZXR1cm4gY2MuZGlyZWN0b3IucnVuU2NlbmUodGhpcy5zY2VuZSk7XG4gIH0sXG4gIGNsZWFyTGF5ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NlbmUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICByZXR1cm4gdGhpcy5sYXllclN0YWNrLmxlbmd0aCA9IDA7XG4gIH0sXG4gIGFkZExheWVyVG9TY2VuZTogZnVuY3Rpb24oY2NiTGF5ZXIsIHpPcmRlcikge1xuICAgIHZhciBsYXlvdXQsIG5vZGU7XG4gICAgaWYgKHpPcmRlciA9PSBudWxsKSB7XG4gICAgICB6T3JkZXIgPSAwO1xuICAgIH1cbiAgICBsYXlvdXQgPSBuZXcgY2N1aS5MYXlvdXQoKTtcbiAgICBsYXlvdXQuc2V0Q29udGVudFNpemUoY2Muc2l6ZSgxMTM2LCA2NDApKTtcbiAgICBsYXlvdXQuc2V0VG91Y2hFbmFibGVkKHRydWUpO1xuICAgIG5vZGUgPSBuZXcgY2MuTm9kZSgpO1xuICAgIG5vZGUuYWRkQ2hpbGQobGF5b3V0KTtcbiAgICBub2RlLmFkZENoaWxkKGNjYkxheWVyKTtcbiAgICB0aGlzLnNjZW5lLmFkZENoaWxkKG5vZGUsIHpPcmRlcik7XG4gICAgcmV0dXJuIHRoaXMubGF5ZXJTdGFjay5wdXNoKG5vZGUpO1xuICB9LFxuICByZW1vdmVUb3BMYXllcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRvcExheWVyO1xuICAgIHRvcExheWVyID0gdGhpcy5sYXllclN0YWNrLnBvcCgpO1xuICAgIHJldHVybiB0aGlzLnNjZW5lLnJlbW92ZUNoaWxkKHRvcExheWVyLCB0cnVlKTtcbiAgfVxufTtcblxuTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBMb2FkZXIoY2NiRmlsZTEsIGNvbnRyb2xsZXJOYW1lMSkge1xuICAgIHRoaXMuY2NiRmlsZSA9IGNjYkZpbGUxO1xuICAgIHRoaXMuY29udHJvbGxlck5hbWUgPSBjb250cm9sbGVyTmFtZTE7XG4gIH1cblxuICBMb2FkZXIucHJvdG90eXBlLnNob3dEaWFsb2cgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY2MuQnVpbGRlclJlYWRlci5sb2FkKHRoaXMuY2NiRmlsZSk7XG4gIH07XG5cbiAgcmV0dXJuIExvYWRlcjtcblxufSkoKTtcblxuTGF5ZXJNYW5hZ2VyLmRlZmluZURpYWxvZyA9IGZ1bmN0aW9uKGNjYkZpbGUsIGNvbnRyb2xsZXJOYW1lLCBjb250cm9sbGVyQ2xhc3MpIHtcbiAgY2MuQnVpbGRlclJlYWRlci5yZWdpc3RlckNvbnRyb2xsZXIoY29udHJvbGxlck5hbWUsIG5ldyBjb250cm9sbGVyQ2xhc3MoKSk7XG4gIHJldHVybiBuZXcgTG9hZGVyKGNjYkZpbGUsIGNvbnRyb2xsZXJOYW1lKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTGF5ZXJNYW5hZ2VyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwxVnpaWEp6TDNSaGIzZDFMM04wZFdSNUwwRnlhMkZrTDBGeWEyRmtSMkZ0WlM5emNtTXZkRzl2YkhNdlFYSnJVMk5sYm1WTllXNWhaMlZ5TG1OdlptWmxaU0lzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk5VmMyVnljeTkwWVc5M2RTOXpkSFZrZVM5QmNtdGhaQzlCY210aFpFZGhiV1V2YzNKakwzUnZiMnh6TDBGeWExTmpaVzVsVFdGdVlXZGxjaTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRMEVzU1VGQlFUczdRVUZCUVN4WlFVRkJMRWRCUTBrN1JVRkJRU3hKUVVGQkxFVkJRVTBzVTBGQlFUdEpRVU5HTEVsQlFVTXNRMEZCUVN4VlFVRkVMRWRCUVdNN1NVRkRaQ3hKUVVGRExFTkJRVUVzUzBGQlJDeEhRVUZUTEVsQlFVa3NSVUZCUlN4RFFVRkRMRXRCUVZBc1EwRkJRVHRYUVVOVUxFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCV2l4RFFVRnhRaXhKUVVGRExFTkJRVUVzUzBGQmRFSTdSVUZJUlN4RFFVRk9PMFZCUzBFc1ZVRkJRU3hGUVVGWkxGTkJRVUU3U1VGRFVpeEpRVUZETEVOQlFVRXNTMEZCU3l4RFFVRkRMR2xDUVVGUUxFTkJRVUU3VjBGRFFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTFCUVZvc1IwRkJjVUk3UlVGR1lpeERRVXhhTzBWQlUwRXNaVUZCUVN4RlFVRnJRaXhUUVVGRExGRkJRVVFzUlVGQlZ5eE5RVUZZTzBGQlEyUXNVVUZCUVRzN1RVRkVlVUlzVTBGQlV6czdTVUZEYkVNc1RVRkJRU3hIUVVGVExFbEJRVWtzU1VGQlNTeERRVUZETEUxQlFWUXNRMEZCUVR0SlFVTlVMRTFCUVUwc1EwRkJReXhqUVVGUUxFTkJRWE5DTEVWQlFVVXNRMEZCUXl4SlFVRklMRU5CUVZFc1NVRkJVaXhGUVVGakxFZEJRV1FzUTBGQmRFSTdTVUZEUVN4TlFVRk5MRU5CUVVNc1pVRkJVQ3hEUVVGMVFpeEpRVUYyUWp0SlFVVkJMRWxCUVVFc1IwRkJUU3hKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZRTEVOQlFVRTdTVUZEVGl4SlFVRkpMRU5CUVVNc1VVRkJUQ3hEUVVGakxFMUJRV1E3U1VGRFFTeEpRVUZKTEVOQlFVTXNVVUZCVEN4RFFVRmpMRkZCUVdRN1NVRkZRU3hKUVVGRExFTkJRVUVzUzBGQlN5eERRVUZETEZGQlFWQXNRMEZCWjBJc1NVRkJhRUlzUlVGQmMwSXNUVUZCZEVJN1YwRkRRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEVsQlFWb3NRMEZCYVVJc1NVRkJha0k3UlVGV1l5eERRVlJzUWp0RlFYRkNRU3hqUVVGQkxFVkJRV2RDTEZOQlFVRTdRVUZEV2l4UlFVRkJPMGxCUVVFc1VVRkJRU3hIUVVGWExFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNSMEZCV2l4RFFVRkJPMWRCUTFnc1NVRkJReXhEUVVGQkxFdEJRVXNzUTBGQlF5eFhRVUZRTEVOQlFXMUNMRkZCUVc1Q0xFVkJRVFpDTEVsQlFUZENPMFZCUmxrc1EwRnlRbWhDT3pzN1FVRjVRa1U3UlVGRFZ5eG5Ra0ZCUXl4UlFVRkVMRVZCUVZjc1pVRkJXRHRKUVVGRExFbEJRVU1zUTBGQlFTeFZRVUZFTzBsQlFWVXNTVUZCUXl4RFFVRkJMR2xDUVVGRU8wVkJRVmc3TzIxQ1FVTmlMRlZCUVVFc1IwRkJZU3hUUVVGQk8xZEJRMVFzUlVGQlJTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRnFRaXhEUVVGelFpeEpRVUZETEVOQlFVRXNUMEZCZGtJN1JVRkVVenM3T3pzN08wRkJSMnBDTEZsQlFWa3NRMEZCUXl4WlFVRmlMRWRCUVRSQ0xGTkJRVU1zVDBGQlJDeEZRVUZWTEdOQlFWWXNSVUZCTUVJc1pVRkJNVUk3UlVGRGVFSXNSVUZCUlN4RFFVRkRMR0ZCUVdFc1EwRkJReXhyUWtGQmFrSXNRMEZEU1N4alFVUktMRVZCUlVrc1NVRkJTU3hsUVVGS0xFTkJRVUVzUTBGR1NqdFRRVXRCTEVsQlFVa3NUVUZCU2l4RFFVRlhMRTlCUVZnc1JVRkJiMElzWTBGQmNFSTdRVUZPZDBJN08wRkJVVFZDTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiJdfQ==
