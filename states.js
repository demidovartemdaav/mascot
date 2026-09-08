/**
 * states.js
 * -------------------------------------------------------------------------
 * Реестр состояний маскота.
 *
 * Каждое состояние — это объект с полями:
 *   name      — строковое имя состояния (идентификатор)
 *   className — CSS-класс, который добавляется к корневому <svg> маскота
 *   onEnter   — (необязательно) callback(mascot), вызывается при входе в состояние
 *   onExit    — (необязательно) callback(mascot), вызывается при выходе из состояния
 *
 * Сама анимация каждого состояния описана в css/mascot.css через keyframes,
 * привязанные к CSS-классу состояния (например, .mascot--idle ...).
 *
 * Система расширяемая: чтобы добавить новое состояние, достаточно дописать
 * свойство в объект MascotStates и добавить соответствующие CSS-правила.
 * После этого можно вызывать mascot.setState('newState').
 *
 * Текущие состояния:
 *   - idle      — покой, лёгкое дыхание и покачивание головы
 *   - walking   — ходьба, поочерёдное движение рук и ног
 *   - looking   — осматривание, повороты головы влево-вправо
 *   - sitting   — сидит, ноги согнуты вперёд, тело опущено
 * -------------------------------------------------------------------------
 */
(function (global) {
    "use strict";

    var MascotStates = {
        idle: {
            name: "idle",
            className: "mascot--idle",
            onEnter: function (/* mascot */) {
                // Анимация idle включается через CSS-класс .mascot--idle.
                // Дополнительной JS-логики на этом этапе не требуется.
            },
            onExit: function (/* mascot */) {}
        },

        walking: {
            name: "walking",
            className: "mascot--walking",
            onEnter: function (/* mascot */) {
                // Анимация ходьбы включается через CSS-класс .mascot--walking.
            },
            onExit: function (/* mascot */) {}
        },

        looking: {
            name: "looking",
            className: "mascot--looking",
            onEnter: function (/* mascot */) {
                // Анимация осматривания включается через CSS-класс .mascot--looking.
            },
            onExit: function (/* mascot */) {}
        },

        sitting: {
            name: "sitting",
            className: "mascot--sitting",
            onEnter: function (/* mascot */) {
                // Поза сидения задаётся через CSS-класс .mascot--sitting.
            },
            onExit: function (/* mascot */) {}
        }
    };

    global.MascotStates = MascotStates;
})(typeof window !== "undefined" ? window : this);
