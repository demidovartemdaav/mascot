/**
 * script.js
 * Базовая интерактивность для статического сайта.
 * Чистый JavaScript, без сторонних библиотек.
 * Файл подключается в конце <body>, поэтому DOM уже готов.
 */
(function () {
    "use strict";

    // Небольшой помощник для получения элемента по id
    function $(id) {
        return document.getElementById(id);
    }

    // --- Инициализация маскота в hero-секции ---
    // На этом этапе маскот просто стоит и демонстрирует idle-анимацию.
    // Другие состояния (walking, looking, sitting) уже реализованы в коде
    // и могут быть активированы вызовом heroMascot.setState('walking') и т.п.
    var heroMascot = null;
    var heroMascotContainer = $("hero-mascot");
    if (heroMascotContainer && typeof Mascot === "function") {
        try {
            heroMascot = new Mascot(heroMascotContainer, { initialState: "idle" });
            // Открываем ссылку для отладки из консоли: window.heroMascot
            window.heroMascot = heroMascot;
        } catch (e) {
            console.warn("Не удалось инициализировать маскота:", e);
        }
    }

    // --- Кнопка "Начать" в hero: плавный переход к секции возможностей ---
    var ctaPrimary = $("cta-primary");
    if (ctaPrimary) {
        ctaPrimary.addEventListener("click", function () {
            var target = $("features");
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // --- Кнопка "Узнать больше": переход к секции "О проекте" ---
    var ctaSecondary = $("cta-secondary");
    if (ctaSecondary) {
        ctaSecondary.addEventListener("click", function () {
            var target = $("about");
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // --- Кнопка "Показать детали": раскрытие/скрытие блока ---
    var aboutBtn = $("about-btn");
    var aboutDetails = $("about-details");
    if (aboutBtn && aboutDetails) {
        aboutBtn.addEventListener("click", function () {
            var isHidden = aboutDetails.hasAttribute("hidden");
            if (isHidden) {
                aboutDetails.removeAttribute("hidden");
                aboutBtn.textContent = "Скрыть детали";
            } else {
                aboutDetails.setAttribute("hidden", "");
                aboutBtn.textContent = "Показать детали";
            }
        });
    }

    // --- Кнопка "Нажми меня": счётчик нажатий ---
    var contactBtn = $("contact-btn");
    var contactFeedback = $("contact-feedback");
    var clickCount = 0;
    if (contactBtn && contactFeedback) {
        contactBtn.addEventListener("click", function () {
            clickCount += 1;
            var word = clickCount === 1 ? "нажатие" : (clickCount < 5 ? "нажатия" : "нажатий");
            contactFeedback.textContent = "Зафиксировано " + clickCount + " " + word + ".";
        });
    }

    // --- Лёгкая подсветка активного пункта навигации при скролле ---
    var navLinks = document.querySelectorAll(".nav__list a");
    var sections = [];
    navLinks.forEach(function (link) {
        var id = link.getAttribute("href");
        if (id && id.charAt(0) === "#") {
            var section = document.querySelector(id);
            if (section) {
                sections.push({ link: link, section: section });
            }
        }
    });

    if (sections.length && "IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    sections.forEach(function (item) {
                        item.link.classList.remove("is-active");
                    });
                    var match = sections.find(function (item) {
                        return item.section === entry.target;
                    });
                    if (match) {
                        match.link.classList.add("is-active");
                    }
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px" });

        sections.forEach(function (item) {
            observer.observe(item.section);
        });
    }

    // Сообщение в консоль, что скрипт загрузился (удобно при отладке)
    console.log("script.js: инициализация завершена.");
})();
