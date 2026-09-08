/**
 * behaviours/intro.js
 * -------------------------------------------------------------------------
 * IntroScene — первое появление маскота после загрузки страницы.
 *
 * Сценарий:
 *   1. Страница загружается, маскот отсутствует (за правой границей viewport).
 *   2. После короткой задержки маскот появляется из-за правого края hero.
 *   3. Идёт влево к центру hero-секции с живым, неровным темпом.
 *   4. Доходит до целевой точки и останавливается.
 *   5. Делает небольшую паузу.
 *   6. Осматривается (состояние looking).
 *   7. Переходит в обычное idle-состояние.
 *
 * Движение:
 *   - Перемещение применяется к обёртке .mascot__actor (внешний div вокруг SVG),
 *     чтобы не конфликтовать с CSS keyframes, которые управляют частями тела.
 *   - Используется easeOutCubic + небольшое синусоидальное дрожание темпа,
 *     чтобы движение выглядело «живым», а не механическим.
 *   - Маскот смотрит в направлении движения через mascot.setFacing('left').
 *
 * Зависимости (порядок загрузки):
 *   1. js/mascot/states.js
 *   2. js/mascot/mascot.js
 *   3. js/mascot/behaviours.js          ← определяет MascotBehaviors.Behavior
 *   4. js/mascot/behaviours/intro.js    ← этот файл
 * -------------------------------------------------------------------------
 */
(function (global) {
    "use strict";

    var Behavior = global.MascotBehaviors && global.MascotBehaviors.Behavior;
    if (!Behavior) {
        console.warn("[IntroScene] MascotBehaviors.Behavior не найден — проверьте порядок загрузки скриптов.");
        return;
    }

    // --- Настройки по умолчанию ---
    var DEFAULTS = {
        startDelay:     400,    // мс до появления маскота
        walkDuration:   2200,   // мс ходьбы от правого края до центра
        settleDelay:    350,    // мс пауза после остановки перед осматриванием
        lookDuration:   2600,   // мс осматривания
        enterOffset:    60,     // px: на сколько за пределы контейнера уйти вправо перед стартом
        targetOffsetX:  0       // px: целевая позиция относительно центра контейнера (0 = центр)
    };

    /**
     * easeOutCubic — классическая кривая замедления к концу.
     * t в [0,1], возвращает [0,1].
     */
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Конструктор IntroScene.
     * @param {Mascot} mascot
     * @param {Object} [options] — любые поля из DEFAULTS можно переопределить
     */
    function IntroScene(mascot, options) {
        Behavior.call(this, mascot, options);
        this.settings = Object.assign({}, DEFAULTS, this.options);
    }

    // Наследование от Behavior
    IntroScene.prototype = Object.create(Behavior.prototype);
    IntroScene.prototype.constructor = IntroScene;

    /**
     * Стартовый метод сцены. Запускается через Behavior.start().
     */
    IntroScene.prototype._start = function () {
        var mascot = this.mascot;
        var s = this.settings;
        var actor = mascot.getActor ? mascot.getActor() : null;
        var container = mascot.container;

        if (!actor || !container) {
            console.warn("[IntroScene] У маскота нет actor-обёртки или контейнера.");
            this._complete();
            return;
        }

        // Вычисляем геометрию в момент старта: размеры могут зависеть от вьюпорта.
        var containerWidth = container.clientWidth;
        var actorWidth = actor.offsetWidth || 20; // ~ширина SVG при высоте 40px
        var centerX = (containerWidth - actorWidth) / 2 + s.targetOffsetX;
        var startX = containerWidth + s.enterOffset; // за правым краем

        // Фаза 0: маскот стоит за правым краем, смотрит влево (по направлению движения)
        actor.style.transform = "translateX(" + startX + "px)";
        mascot.setFacing("left");

        // Фаза 1: через startDelay включаем walking и начинаем движение
        var self = this;
        this.setTimeout(function () {
            if (!self._running) { return; }
            mascot.setState("walking");
            self._runWalk(actor, startX, centerX, s.walkDuration);
        }, s.startDelay);
    };

    /**
     * Фаза ходьбы: requestAnimationFrame-цикл с easeOutCubic + дрожание темпа.
     */
    IntroScene.prototype._runWalk = function (actor, fromX, toX, duration) {
        var self = this;
        var mascot = this.mascot;

        this.loop(function (delta, elapsed) {
            var t = Math.min(elapsed / duration, 1);
            // Базовая кривая замедления
            var eased = easeOutCubic(t);
            // Небольшое «живое» дрожание темпа: амплитуда убывает к концу,
            // частота низкая, чтобы движение не дёргалось, а «дышало».
            var wobble = (1 - t) * 0.04 * Math.sin(elapsed * 0.012);
            var progress = Math.max(0, Math.min(1, eased + wobble));

            var x = fromX + (toX - fromX) * progress;
            actor.style.transform = "translateX(" + x.toFixed(2) + "px)";

            if (t >= 1) {
                self._onArrived();
                return false; // остановить цикл
            }
            return true;
        });
    };

    /**
     * Фаза после прибытия: остановка → пауза → осматривание → idle.
     */
    IntroScene.prototype._onArrived = function () {
        var mascot = this.mascot;
        var s = this.settings;
        var self = this;

        // Останавливаемся: ноги вместе, тело прямо. Используем idle как «стойку»,
        // но без перехода к финальному idle — мы ещё будем осматриваться.
        mascot.setState("idle");

        this.setTimeout(function () {
            if (!self._running) { return; }
            mascot.setState("looking");
            self.setTimeout(function () {
                if (!self._running) { return; }
                mascot.setState("idle");
                self._complete();
            }, s.lookDuration);
        }, s.settleDelay);
    };

    // Регистрируем поведение в реестре
    global.MascotBehaviors.IntroScene = IntroScene;
})(typeof window !== "undefined" ? window : this);
