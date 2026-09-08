/**
 * mascot.js
 * -------------------------------------------------------------------------
 * Базовый класс Mascot — инкапсулирует SVG-персонажа и машину состояний.
 *
 * Архитектура:
 *   - SVG генерируется из строки-шаблона и вставляется в контейнер.
 *   - Каждая анимируемая часть тела обёрнута в <g> с CSS-классом
 *     (mascot__head, mascot__body, mascot__arm--left/right,
 *      mascot__leg--left/right). Это позволяет анимировать их независимо
 *      через CSS keyframes.
 *   - Машина состояний переключает CSS-класс на корневом <svg>, что
 *     автоматически запускает нужный набор анимаций.
 *
 * Использование:
 *   var mascot = new Mascot(document.getElementById('hero-mascot'));
 *   mascot.setState('walking');       // перейти в состояние ходьбы
 *   mascot.getState();                // => 'walking'
 *   mascot.destroy();                 // убрать SVG из DOM
 *
 * Зависимости: js/mascot/states.js (глобальный объект MascotStates)
 *              должен быть загружен ДО этого файла.
 * -------------------------------------------------------------------------
 */
(function (global) {
    "use strict";

    // -------------------------------------------------------------------------
    // SVG-шаблон маскота.
    // viewBox 40×80, рендерится с высотой ~40px (см. css/mascot.css).
    // Стиль Xiao Xiao: чёрный stickman, круглая голова, толстые линии.
    // -------------------------------------------------------------------------
    var SVG_TEMPLATE = ''
        + '<svg class="mascot" viewBox="0 0 40 80" '
        +      'preserveAspectRatio="xMidYMid meet" '
        +      'aria-hidden="true" focusable="false">'
        +   '<g class="mascot__body">'
        +     '<line class="mascot__torso" x1="20" y1="17" x2="20" y2="42" />'
        +     '<g class="mascot__arm mascot__arm--left">'
        +       '<line x1="20" y1="22" x2="11" y2="36" />'
        +     '</g>'
        +     '<g class="mascot__arm mascot__arm--right">'
        +       '<line x1="20" y1="22" x2="29" y2="36" />'
        +     '</g>'
        +     '<g class="mascot__leg mascot__leg--left">'
        +       '<line x1="20" y1="42" x2="13" y2="74" />'
        +     '</g>'
        +     '<g class="mascot__leg mascot__leg--right">'
        +       '<line x1="20" y1="42" x2="27" y2="74" />'
        +     '</g>'
        +     '<g class="mascot__head">'
        +       '<circle cx="20" cy="10" r="7" />'
        +     '</g>'
        +   '</g>'
        + '</svg>';

    /**
     * Создаёт SVG-элемент маскота из шаблонной строки.
     * Использование <div>.innerHTML корректно создаёт SVG с нужным namespace
     * во всех современных браузерах.
     * @returns {SVGSVGElement}
     */
    function buildSVG() {
        var wrapper = document.createElement("div");
        wrapper.innerHTML = SVG_TEMPLATE;
        return wrapper.firstElementChild;
    }

    /**
     * Конструктор маскота.
     * @param {HTMLElement} container — элемент, в который будет вставлен SVG
     * @param {Object} [options] — настройки
     * @param {string} [options.initialState='idle'] — стартовое состояние
     */
    function Mascot(container, options) {
        if (!container) {
            throw new Error("Mascot: требуется контейнер для размещения SVG.");
        }
        options = options || {};

        this.container = container;
        this.currentState = null;
        this.svg = buildSVG();
        this.container.appendChild(this.svg);

        // Удобная ссылка на часто используемые части тела.
        this.parts = {
            body:  this.svg.querySelector(".mascot__body"),
            torso: this.svg.querySelector(".mascot__torso"),
            head:  this.svg.querySelector(".mascot__head"),
            armLeft:  this.svg.querySelector(".mascot__arm--left"),
            armRight: this.svg.querySelector(".mascot__arm--right"),
            legLeft:  this.svg.querySelector(".mascot__leg--left"),
            legRight: this.svg.querySelector(".mascot__leg--right")
        };

        this.setState(options.initialState || "idle");
    }

    /**
     * Переключает маскота в указанное состояние.
     * Снимает все state-классы, затем добавляет класс нового состояния
     * и вызывает onEnter/onExit хуки, если они определены.
     * @param {string} name — имя состояния из реестра MascotStates
     */
    Mascot.prototype.setState = function (name) {
        if (!global.MascotStates || !global.MascotStates[name]) {
            console.warn("[Mascot] Неизвестное состояние:", name);
            return;
        }
        if (this.currentState === name) {
            return;
        }

        var prev = this.currentState ? global.MascotStates[this.currentState] : null;
        var next = global.MascotStates[name];

        if (prev && typeof prev.onExit === "function") {
            prev.onExit(this);
        }

        // Снимаем все state-классы, чтобы анимации прошлого состояния
        // гарантированно остановились.
        var self = this;
        Object.keys(global.MascotStates).forEach(function (key) {
            self.svg.classList.remove(global.MascotStates[key].className);
        });

        this.currentState = name;
        this.svg.classList.add(next.className);

        if (typeof next.onEnter === "function") {
            next.onEnter(this);
        }
    };

    /**
     * Возвращает имя текущего состояния.
     * @returns {string|null}
     */
    Mascot.prototype.getState = function () {
        return this.currentState;
    };

    /**
     * Возвращает корневой SVG-элемент маскота.
     * Полезно для дополнительных манипуляций извне.
     * @returns {SVGSVGElement}
     */
    Mascot.prototype.getSVG = function () {
        return this.svg;
    };

    /**
     * Удаляет маскота из DOM и очищает ссылки.
     */
    Mascot.prototype.destroy = function () {
        if (this.svg && this.svg.parentNode) {
            this.svg.parentNode.removeChild(this.svg);
        }
        this.container = null;
        this.svg = null;
        this.parts = null;
        this.currentState = null;
    };

    global.Mascot = Mascot;
})(typeof window !== "undefined" ? window : this);
