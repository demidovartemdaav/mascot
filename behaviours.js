/**
 * behaviours.js
 * -------------------------------------------------------------------------
 * Базовый класс Behavior и реестр поведений маскота.
 *
 * Поведение (Behavior) — это самостоятельный сценарий, который «ведёт» маскота
 * во времени: меняет его состояние, позицию, направление взгляда и т.д.
 * Поведение запускается поверх существующей машины состояний и само решает,
 * в какое состояние перевести маскота в каждый момент.
 *
 * Архитектура:
 *   - Behavior (базовый класс): предоставляет каркас start()/stop()/isRunning(),
 *     таймеры и requestAnimationFrame с автоматической очисткой при stop().
 *   - MascotBehaviors (реестр): имя -> конструктор поведения.
 *     Используется как глобальный реестр доступных поведений.
 *
 * Использование:
 *   var intro = new MascotBehaviors.IntroScene(mascot, options);
 *   intro.start();
 *   intro.onComplete = function() { console.log('Сцена завершена'); };
 *
 * Чтобы добавить новое поведение:
 *   1. Создать класс-наследник Behavior в js/mascot/behaviours/<name>.js
 *   2. Зарегистрировать его в реестре: MascotBehaviors.<Name> = <Class>;
 * -------------------------------------------------------------------------
 */
(function (global) {
    "use strict";

    // -------------------------------------------------------------------------
    // Базовый класс Behavior
    // -------------------------------------------------------------------------
    function Behavior(mascot, options) {
        this.mascot = mascot;
        this.options = options || {};
        this._running = false;
        this._rafId = null;
        this._timeouts = [];
        this.onComplete = null;   // callback() без аргументов
    }

    /**
     * Запускает поведение. Подклассы переопределяют _start().
     */
    Behavior.prototype.start = function () {
        if (this._running) {
            return;
        }
        if (!this.mascot) {
            throw new Error("Behavior: маскот не задан.");
        }
        this._running = true;
        if (typeof this._start === "function") {
            this._start();
        }
    };

    /**
     * Останавливает поведение и очищает все таймеры/RAF.
     */
    Behavior.prototype.stop = function () {
        this._running = false;
        if (this._rafId !== null && typeof global.cancelAnimationFrame === "function") {
            global.cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        for (var i = 0; i < this._timeouts.length; i++) {
            global.clearTimeout(this._timeouts[i]);
        }
        this._timeouts = [];
        if (typeof this._stop === "function") {
            this._stop();
        }
    };

    Behavior.prototype.isRunning = function () {
        return this._running;
    };

    // --- Вспомогательные методы для подклассов ---

    /**
     * setTimeout с автоматической регистрацией для последующей очистки.
     */
    Behavior.prototype.setTimeout = function (fn, delay) {
        var self = this;
        var id = global.setTimeout(function () {
            // убираем id из списка сразу после срабатывания
            var idx = self._timeouts.indexOf(id);
            if (idx !== -1) { self._timeouts.splice(idx, 1); }
            if (self._running) { fn(); }
        }, delay);
        this._timeouts.push(id);
        return id;
    };

    /**
     * requestAnimationFrame-цикл. fn получает delta (ms) и elapsed (ms).
     * Если fn вернёт false, цикл остановится.
     */
    Behavior.prototype.loop = function (fn) {
        var self = this;
        var last = 0;
        var startTs = 0;
        function step(ts) {
            if (!self._running) { return; }
            if (startTs === 0) { startTs = ts; }
            if (last === 0) { last = ts; }
            var delta = ts - last;
            var elapsed = ts - startTs;
            last = ts;
            var keepGoing = fn(delta, elapsed);
            if (keepGoing === false) {
                self._rafId = null;
                return;
            }
            self._rafId = global.requestAnimationFrame(step);
        }
        self._rafId = global.requestAnimationFrame(step);
    };

    /**
     * Завершает поведение: останавливает цикл и вызывает onComplete.
     */
    Behavior.prototype._complete = function () {
        if (!this._running) { return; }
        this.stop();
        if (typeof this.onComplete === "function") {
            this.onComplete();
        }
    };

    // -------------------------------------------------------------------------
    // Реестр поведений
    // -------------------------------------------------------------------------
    var MascotBehaviors = {
        Behavior: Behavior
    };

    global.MascotBehaviors = MascotBehaviors;
})(typeof window !== "undefined" ? window : this);
