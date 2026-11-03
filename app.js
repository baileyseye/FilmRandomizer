/* ============================================================
   FilmRandom — app.js
   Чистый Vanilla JS, без fetch / import / внешних ресурсов.
   Хранение состояния: localStorage (ключ filmRandom.state).
   ============================================================ */

(function () {
    'use strict';

    /* ---------------- Константы ---------------- */

    var STORAGE_KEY = 'filmRandom.state';
    var HISTORY_KEY = 'filmRandom.history';
    var HISTORY_LIMIT = 5;

    var DEFAULT_STATE = {
        user1: {
            films: ['example_1_USER1'],
            watched: ['example_2_USER1', 'example_3_USER1']
        },
        user2: {
            films: ['example_3_USER2'],
            watched: ['example_2_USER2', 'example_1_USER2']
        }
    };

    var USER_KEYS = ['user1', 'user2'];
    var USER_LABELS = { user1: 'Пользователь 1', user2: 'Пользователь 2' };
    var USER_EMOJI = { user1: '🍿', user2: '⭐' };
    var LIST_LABELS = { films: 'К просмотру', watched: 'Просмотрено' };

    var TOAST_ICONS = { success: '✅', error: '⛔', warn: '⚠️', info: 'ℹ️' };

    var SPIN_DURATION = 1300; // мс — «рулетка»

    /* ---------------- Переменные состояния ---------------- */

    var state = null;              // { user1: {films, watched}, user2: {films, watched} }
    var history = [];              // [{title, user, time}]
    var selectedUser = null;       // 'user1' | 'user2' | null
    var storageOk = true;          // доступен ли localStorage
    var storageWarned = false;
    var isSpinning = false;
    var watchedPanelShown = false;
    var modalResolve = null;

    var ui = {
        activeTab: { user1: 'films', user2: 'films' },
        search: { user1: '', user2: '' }
    };

    var panels = {};   // ссылки на DOM-элементы панелей
    var els = {};      // кэш остальных элементов

    /* ---------------- Утилиты ---------------- */

    function deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function cleanLine(value) {
        return String(value == null ? '' : value)
            .replace(/^\uFEFF/, '')
            .replace(/\r/g, '')
            .trim();
    }

    function toStrArray(value) {
        if (!Array.isArray(value)) return [];
        var out = [];
        for (var i = 0; i < value.length; i++) {
            var s = cleanLine(value[i]);
            if (s.length > 0) out.push(s);
        }
        return out;
    }

    function normalizeState(raw) {
        var out = {
            user1: { films: [], watched: [] },
            user2: { films: [], watched: [] }
        };
        if (raw && typeof raw === 'object') {
            USER_KEYS.forEach(function (key) {
                var u = raw[key];
                if (u && typeof u === 'object') {
                    out[key].films = toStrArray(u.films);
                    out[key].watched = toStrArray(u.watched);
                }
            });
        }
        return out;
    }

    function normalizeHistory(raw) {
        if (!Array.isArray(raw)) return [];
        var out = [];
        for (var i = 0; i < raw.length && out.length < HISTORY_LIMIT; i++) {
            var item = raw[i];
            var title = '';
            var user = '';
            var time = '';
            if (item && typeof item === 'object') {
                title = cleanLine(item.title);
                user = USER_KEYS.indexOf(item.user) !== -1 ? item.user : '';
                time = typeof item.time === 'string' ? item.time : '';
            } else {
                title = cleanLine(item);
            }
            if (title.length > 0) out.push({ title: title, user: user, time: time });
        }
        return out;
    }

    function formatTime(iso) {
        if (!iso) return '';
        try {
            var d = new Date(iso);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleString('ru-RU', {
                day: '2-digit', month: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    }

    function totalFilms() {
        return state.user1.films.length + state.user2.films.length;
    }

    function totalWatched() {
        return state.user1.watched.length + state.user2.watched.length;
    }

    /* ---------------- localStorage ---------------- */

    function checkStorage() {
        try {
            var probe = '__filmrandom_probe__';
            window.localStorage.setItem(probe, '1');
            window.localStorage.removeItem(probe);
            return true;
        } catch (e) {
            return false;
        }
    }

    function persist() {
        if (!storageOk) {
            if (!storageWarned) {
                storageWarned = true;
                toast('localStorage недоступен: изменения живут только до перезагрузки страницы.', 'warn', 6500);
            }
            return;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            toast('Не удалось сохранить данные: ' + (e && e.message ? e.message : 'ошибка'), 'error');
        }
    }

    function loadState() {
        if (!storageOk) return deepCopy(DEFAULT_STATE);
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return deepCopy(DEFAULT_STATE);
            return normalizeState(JSON.parse(raw));
        } catch (e) {
            return deepCopy(DEFAULT_STATE);
        }
    }

    function loadHistory() {
        if (!storageOk) return [];
        try {
            var raw = window.localStorage.getItem(HISTORY_KEY);
            if (!raw) return [];
            return normalizeHistory(JSON.parse(raw));
        } catch (e) {
            return [];
        }
    }

    /* ---------------- Тосты ---------------- */

    function toast(message, type, duration) {
        type = type || 'info';
        duration = duration || 3800;

        var el = document.createElement('div');
        el.className = 'toast toast-' + type;

        var icon = document.createElement('span');
        icon.className = 'toast-icon';
        icon.textContent = TOAST_ICONS[type] || 'ℹ️';

        var text = document.createElement('span');
        text.className = 'toast-text';
        text.textContent = message;

        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'toast-close';
        close.textContent = '✕';
        close.setAttribute('aria-label', 'Закрыть уведомление');

        el.appendChild(icon);
        el.appendChild(text);
        el.appendChild(close);
        els.toastContainer.appendChild(el);

        window.requestAnimationFrame(function () { el.classList.add('show'); });

        var closed = false;
        var timer = window.setTimeout(dismiss, duration);

        function dismiss() {
            if (closed) return;
            closed = true;
            window.clearTimeout(timer);
            el.classList.remove('show');
            window.setTimeout(function () {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 340);
        }

        close.addEventListener('click', dismiss);
    }

    /* ---------------- Модальное окно (Y/N) ---------------- */

    function confirmDialog(options) {
        options = options || {};
        return new Promise(function (resolve) {
            modalResolve = resolve;
            els.modalTitle.textContent = options.title || 'Подтверждение';
            els.modalText.textContent = options.text || '';
            els.modalYes.textContent = options.yesText || 'Да';
            els.modalNo.textContent = options.noText || 'Нет';
            els.modalOverlay.hidden = false;
            window.requestAnimationFrame(function () { els.modalOverlay.classList.add('open'); });
            window.setTimeout(function () { els.modalYes.focus(); }, 60);
        });
    }

    function closeModal(result) {
        if (els.modalOverlay.hidden) return;
        els.modalOverlay.classList.remove('open');
        window.setTimeout(function () { els.modalOverlay.hidden = true; }, 220);
        if (typeof modalResolve === 'function') {
            var fn = modalResolve;
            modalResolve = null;
            fn(!!result);
        }
    }

    /* ---------------- Рендер ---------------- */

    function renderAll() {
        renderTotals();
        renderUserButtons();
        renderPanel('user1');
        renderPanel('user2');
        renderHistory();
        if (watchedPanelShown) renderWatchedPanel();
        updatePickButton();
    }

    function renderTotals() {
        els.totalFilms.textContent = String(totalFilms());
        els.totalWatched.textContent = String(totalWatched());
        els.u1FilmsCount.textContent = String(state.user1.films.length);
        els.u1WatchedCount.textContent = String(state.user1.watched.length);
        els.u2FilmsCount.textContent = String(state.user2.films.length);
        els.u2WatchedCount.textContent = String(state.user2.watched.length);
    }

    function renderUserButtons() {
        USER_KEYS.forEach(function (user) {
            var btn = document.querySelector('.user-btn[data-user="' + user + '"]');
            if (!btn) return;
            var active = selectedUser === user;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            var panel = panels[user] && panels[user].root;
            if (panel) panel.classList.toggle('focused', active);
        });
    }

    function createFilmItem(user, listKey, title, index) {
        var li = document.createElement('li');
        li.className = 'film-item';
        li.setAttribute('data-index', String(index));
        li.setAttribute('data-list', listKey);

        var num = document.createElement('span');
        num.className = 'film-num';
        num.textContent = String(index + 1);

        var name = document.createElement('span');
        name.className = 'film-title';
        name.textContent = title;
        name.title = title;

        var actions = document.createElement('div');
        actions.className = 'film-actions';

        if (listKey === 'watched') {
            var restore = document.createElement('button');
            restore.type = 'button';
            restore.className = 'icon-btn';
            restore.textContent = '↩';
            restore.title = 'Вернуть в «К просмотру»';
            restore.setAttribute('aria-label', 'Вернуть фильм в список к просмотру');
            restore.setAttribute('data-action', 'restore');
            actions.appendChild(restore);
        }

        var del = document.createElement('button');
        del.type = 'button';
        del.className = 'icon-btn danger';
        del.textContent = '✕';
        del.title = 'Удалить из списка';
        del.setAttribute('aria-label', 'Удалить фильм из списка');
        del.setAttribute('data-action', 'delete');
        actions.appendChild(del);

        li.appendChild(num);
        li.appendChild(name);
        li.appendChild(actions);
        return li;
    }

    function renderPanel(user) {
        var p = panels[user];
        if (!p) return;

        var tab = ui.activeTab[user] === 'watched' ? 'watched' : 'films';
        ui.activeTab[user] = tab;
        var list = state[user][tab];
        var query = (ui.search[user] || '').trim().toLowerCase();

        p.countFilms.textContent = String(state[user].films.length);
        p.countWatched.textContent = String(state[user].watched.length);

        p.tabs.forEach(function (btn) {
            var isActive = btn.getAttribute('data-tab') === tab;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        p.ul.innerHTML = '';
        var shown = 0;
        for (var i = 0; i < list.length; i++) {
            if (query && list[i].toLowerCase().indexOf(query) === -1) continue;
            p.ul.appendChild(createFilmItem(user, tab, list[i], i));
            shown++;
        }

        if (shown === 0) {
            p.emptyNote.hidden = false;
            if (query) {
                p.emptyNote.textContent = 'По запросу «' + ui.search[user].trim() + '» ничего не найдено.';
            } else {
                p.emptyNote.textContent = tab === 'films'
                    ? 'Список «К просмотру» пуст — добавьте фильм или импортируйте .txt'
                    : 'Список «Просмотрено» пуст — фильмы появятся здесь после случайного выбора.';
            }
        } else {
            p.emptyNote.hidden = true;
            p.emptyNote.textContent = '';
        }

        p.addForm.hidden = tab !== 'films';
        p.watchedNote.hidden = tab === 'films';
        p.search.placeholder = tab === 'films'
            ? '🔍 Поиск в списке «К просмотру»…'
            : '🔍 Поиск в списке «Просмотрено»…';
    }

    function renderHistory() {
        els.historyBox.hidden = history.length === 0;
        els.historyList.innerHTML = '';
        history.forEach(function (item) {
            var li = document.createElement('li');

            var title = document.createElement('span');
            title.className = 'history-title-text';
            title.textContent = item.title;

            var meta = document.createElement('span');
            meta.className = 'history-meta';
            var parts = [];
            if (item.user && USER_LABELS[item.user]) parts.push(USER_LABELS[item.user]);
            var t = formatTime(item.time);
            if (t) parts.push(t);
            meta.textContent = parts.length ? parts.join(' · ') : '';

            li.appendChild(title);
            li.appendChild(meta);
            els.historyList.appendChild(li);
        });
    }

    function renderWatchedPanel() {
        els.watchedColumns.innerHTML = '';
        var anyShown = false;

        USER_KEYS.forEach(function (user) {
            var arr = state[user].watched;
            if (!arr.length) return; // показываем только непустые списки
            anyShown = true;

            var col = document.createElement('div');
            col.className = 'watched-col';

            var head = document.createElement('h4');
            head.textContent = USER_EMOJI[user] + ' ' + USER_LABELS[user] + ' (' + arr.length + ')';

            var ol = document.createElement('ol');
            ol.className = 'watched-list';
            arr.forEach(function (title) {
                var li = document.createElement('li');
                li.textContent = title;
                ol.appendChild(li);
            });

            col.appendChild(head);
            col.appendChild(ol);
            els.watchedColumns.appendChild(col);
        });

        els.watchedEmptyNote.hidden = anyShown;
    }

    function updatePickButton() {
        var ready = !!selectedUser && state[selectedUser].films.length > 0;
        els.pickBtn.classList.toggle('ready', ready && !isSpinning);
        els.pickBtn.disabled = isSpinning;
    }

    function setRouletteText(text, mode) {
        els.rouletteTitle.textContent = text;
        els.rouletteTitle.className = 'roulette-title' + (mode ? ' ' + mode : '');
    }

    function clearPickResult() {
        els.pickResult.hidden = true;
        els.pickResult.classList.remove('pop');
        els.pickResultName.textContent = '';
        els.pickResultMeta.textContent = '';
    }

    /* ---------------- Логика FilmSelector ---------------- */

    function requireUser() {
        if (!selectedUser) {
            toast('Не выбран пользователь. Сначала выберите Пользователя 1 или 2.', 'error', 4500);
            els.userSection.classList.remove('shake');
            void els.userSection.offsetWidth;
            els.userSection.classList.add('shake');
            els.userSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
        return true;
    }

    function pickRandomFilm() {
        if (isSpinning) return;
        if (!requireUser()) return;

        var list = state[selectedUser].films;

        if (!list.length) {
            toast('Фильмов нет, список пуст', 'warn', 4500);
            setRouletteText('Список «К просмотру» пуст у пользователя «' + USER_LABELS[selectedUser] + '»', 'empty-state');
            clearPickResult();
            return;
        }

        var index = Math.floor(Math.random() * list.length);
        var chosen = list[index];
        var owner = selectedUser;

        isSpinning = true;
        clearPickResult();
        updatePickButton();
        spinRoulette(list, chosen, function () {
            // удаляем из «к просмотру» и добавляем в конец «просмотрено»
            state[owner].films.splice(index, 1);
            state[owner].watched.push(chosen);

            history.unshift({ title: chosen, user: owner, time: new Date().toISOString() });
            history = history.slice(0, HISTORY_LIMIT);

            persist();
            renderAll();
            showPickResult(chosen, owner);

            isSpinning = false;
            updatePickButton();
        });
    }

    function spinRoulette(pool, finalTitle, done) {
        var start = Date.now();

        setRouletteText(pool[Math.floor(Math.random() * pool.length)], 'spinning');

        function step() {
            var elapsed = Date.now() - start;

            if (elapsed >= SPIN_DURATION) {
                setRouletteText(finalTitle, 'final');
                window.setTimeout(done, 260);
                return;
            }

            setRouletteText(pool[Math.floor(Math.random() * pool.length)], 'spinning');
            var progress = elapsed / SPIN_DURATION;
            var delay = 45 + progress * progress * 210; // плавное замедление
            window.setTimeout(step, delay);
        }

        window.setTimeout(step, 45);
    }

    function showPickResult(title, owner) {
        els.pickResultName.textContent = title;
        els.pickResultMeta.textContent =
            'Фильм удалён из списка «К просмотру» и добавлен в конец списка «Просмотрено» (' +
            USER_LABELS[owner] + ').';
        els.pickResult.hidden = false;
        els.pickResult.classList.remove('pop');
        void els.pickResult.offsetWidth;
        els.pickResult.classList.add('pop');
        toast('🎬 Случайный фильм: ' + title, 'success', 4200);
    }

    /* ---------------- Редактирование списков ---------------- */

    function addFilm(user, rawTitle) {
        var title = cleanLine(rawTitle);
        if (!title) {
            toast('Введите название фильма — пустая строка не добавлена.', 'warn');
            return false;
        }
        if (state[user].films.indexOf(title) !== -1) {
            toast('Фильм «' + title + '» уже есть в списке «К просмотру» (' + USER_LABELS[user] + ').', 'warn', 4500);
            return false;
        }
        state[user].films.push(title);
        persist();
        ui.activeTab[user] = 'films';
        renderAll();
        toast('Фильм «' + title + '» добавлен: ' + USER_LABELS[user] + ' → К просмотру.', 'success');
        return true;
    }

    function deleteFilm(user, listKey, index) {
        var arr = state[user][listKey];
        if (!arr || index < 0 || index >= arr.length) return;
        var title = arr[index];
        arr.splice(index, 1);
        persist();
        renderAll();
        toast('Фильм «' + title + '» удалён: ' + USER_LABELS[user] + ' → ' + LIST_LABELS[listKey] + '.', 'info');
    }

    function restoreFilm(user, index) {
        var watched = state[user].watched;
        if (index < 0 || index >= watched.length) return;
        var title = watched[index];
        watched.splice(index, 1);

        if (state[user].films.indexOf(title) !== -1) {
            toast('Фильм «' + title + '» уже есть в списке «К просмотру» — дубликат не добавлен.', 'warn', 4500);
        } else {
            state[user].films.push(title);
            toast('↩ Фильм «' + title + '» возвращён в список «К просмотру» (' + USER_LABELS[user] + ').', 'success');
        }

        persist();
        ui.activeTab[user] = 'watched';
        renderAll();
    }

    /* ---------------- Экспорт ---------------- */

    function downloadBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        window.setTimeout(function () {
            if (a.parentNode) a.parentNode.removeChild(a);
            URL.revokeObjectURL(url);
        }, 150);
    }

    function exportJson() {
        var payload = {
            user1: { films: state.user1.films.slice(), watched: state.user1.watched.slice() },
            user2: { films: state.user2.films.slice(), watched: state.user2.watched.slice() },
            history: history.slice(),
            exportedAt: new Date().toISOString(),
            app: 'FilmRandom'
        };
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
        downloadBlob(blob, 'filmrandom-state.json');
        toast('Экспортировано полное состояние в filmrandom-state.json', 'success');
    }

    function exportTxt() {
        var files = [
            { name: 'user1_films.txt', data: state.user1.films },
            { name: 'user2_films.txt', data: state.user2.films },
            { name: 'user1_watched_films.txt', data: state.user1.watched },
            { name: 'user2_watched_films.txt', data: state.user2.watched }
        ];

        files.forEach(function (file, i) {
            window.setTimeout(function () {
                var content = file.data.length ? file.data.join('\n') + '\n' : '';
                var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                downloadBlob(blob, file.name);
            }, i * 400);
        });

        toast('Скачиваются 4 файла .txt (по одному фильму на строку)…', 'success', 4500);
    }

    /* ---------------- Импорт ---------------- */

    function looksLikeJson(text) {
        var t = text.trim();
        return t.charAt(0) === '{' || t.charAt(0) === '[';
    }

    function importFromText(text, fileName) {
        var lower = (fileName || '').toLowerCase();
        if (lower.slice(-5) === '.json' || looksLikeJson(text)) {
            importJson(text);
        } else {
            importTxt(text);
        }
    }

    function importTxt(text) {
        var targetValue = els.txtTarget.value.split(':');
        var user = targetValue[0];
        var listKey = targetValue[1] === 'watched' ? 'watched' : 'films';
        var append = !!els.txtAppend.checked;

        if (USER_KEYS.indexOf(user) === -1) {
            toast('Некорректно выбран список для импорта.', 'error');
            return;
        }

        var lines = text.split(/\r?\n/).map(cleanLine).filter(function (line) { return line.length > 0; });

        if (!lines.length) {
            toast('В файле не найдено ни одной непустой строки.', 'warn');
            return;
        }

        var base = append ? state[user][listKey].slice() : [];
        var added = 0;
        var skipped = 0;

        lines.forEach(function (line) {
            if (base.indexOf(line) === -1) {
                base.push(line);
                added++;
            } else {
                skipped++;
            }
        });

        state[user][listKey] = base;
        ui.activeTab[user] = listKey;
        ui.search[user] = '';
        persist();
        renderAll();

        toast('Импорт .txt: добавлено ' + added +
            (skipped ? ', пропущено дубликатов ' + skipped : '') +
            ' → ' + USER_LABELS[user] + ' / ' + LIST_LABELS[listKey] + '.', 'success', 5000);
    }

    function importJson(text) {
        var data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            toast('Файл .json повреждён или имеет неверный формат.', 'error', 5000);
            return;
        }

        if (!data || typeof data !== 'object') {
            toast('В .json ожидался объект с полями user1 / user2.', 'error', 5000);
            return;
        }

        state = normalizeState(data);
        if (Array.isArray(data.history)) history = normalizeHistory(data.history);

        persist();
        renderAll();

        toast('Состояние загружено из .json: ' + totalFilms() + ' к просмотру, ' + totalWatched() + ' просмотрено.', 'success', 5000);
    }

    /* ---------------- Сброс ---------------- */

    function resetAll() {
        confirmDialog({
            title: 'Сбросить все данные?',
            text: 'Списки вернутся к исходным данным проекта (example_1_USER1, example_2_USER1, example_3_USER1, example_3_USER2, example_2_USER2, example_1_USER2). История выборов будет очищена.',
            yesText: 'Да, сбросить',
            noText: 'Отмена'
        }).then(function (yes) {
            if (!yes) {
                toast('Сброс отменён.', 'info', 2500);
                return;
            }
            state = deepCopy(DEFAULT_STATE);
            history = [];
            selectedUser = null;
            watchedPanelShown = false;
            ui.activeTab = { user1: 'films', user2: 'films' };
            ui.search = { user1: '', user2: '' };
            els.watchedPanel.hidden = true;
            els.showWatchedBtn.textContent = '👀 Показать просмотренные фильмы';
            if (panels.user1) { panels.user1.search.value = ''; }
            if (panels.user2) { panels.user2.search.value = ''; }
            setRouletteText('Сначала выберите пользователя, затем нажмите кнопку ниже', 'idle');
            clearPickResult();
            persist();
            renderAll();
            toast('Данные сброшены к значениям по умолчанию.', 'success');
        });
    }

    /* ---------------- Построение панелей ---------------- */

    function buildPanels() {
        USER_KEYS.forEach(function (user) {
            var root = document.createElement('article');
            root.className = 'panel';
            root.setAttribute('data-user', user);

            root.innerHTML =
                '<header class="panel-head">' +
                '<h3 class="panel-title"><span class="panel-emoji" aria-hidden="true">' + USER_EMOJI[user] + '</span>' + USER_LABELS[user] + '</h3>' +
                '<div class="tabs" role="tablist" aria-label="Списки пользователя">' +
                '<button type="button" class="tab" data-tab="films" role="tab" aria-selected="true">🎞 К просмотру <span class="count">0</span></button>' +
                '<button type="button" class="tab" data-tab="watched" role="tab" aria-selected="false">✅ Просмотрено <span class="count">0</span></button>' +
                '</div>' +
                '</header>' +
                '<div class="panel-tools">' +
                '<input type="search" class="input search-input" placeholder="🔍 Поиск по списку…" aria-label="Поиск по списку фильмов">' +
                '</div>' +
                '<div class="panel-body">' +
                '<ul class="film-list"></ul>' +
                '<p class="empty-note" hidden></p>' +
                '</div>' +
                '<form class="add-form" autocomplete="off">' +
                '<input type="text" class="input add-input" placeholder="Название фильма…" maxlength="200" aria-label="Название нового фильма">' +
                '<button type="submit" class="btn btn-secondary btn-small">➕ Добавить</button>' +
                '</form>' +
                '<p class="watched-note" hidden>Фильмы попадают сюда автоматически после случайного выбора. Кнопка ↩ возвращает фильм в «К просмотру», ✕ — удаляет.</p>';

            els.listsGrid.appendChild(root);

            var panel = {
                root: root,
                tabs: Array.prototype.slice.call(root.querySelectorAll('.tab')),
                countFilms: root.querySelector('.tab[data-tab="films"] .count'),
                countWatched: root.querySelector('.tab[data-tab="watched"] .count'),
                search: root.querySelector('.search-input'),
                ul: root.querySelector('.film-list'),
                emptyNote: root.querySelector('.empty-note'),
                addForm: root.querySelector('.add-form'),
                addInput: root.querySelector('.add-input'),
                watchedNote: root.querySelector('.watched-note')
            };
            panels[user] = panel;

            panel.tabs.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    ui.activeTab[user] = btn.getAttribute('data-tab');
                    renderPanel(user);
                });
            });

            panel.search.addEventListener('input', function () {
                ui.search[user] = panel.search.value;
                renderPanel(user);
            });

            panel.addForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var value = panel.addInput.value;
                if (addFilm(user, value)) panel.addInput.value = '';
                panel.addInput.focus();
            });

            panel.ul.addEventListener('click', function (e) {
                var target = e.target;
                var btn = target && target.closest ? target.closest('button[data-action]') : null;
                if (!btn) return;
                var li = btn.closest('li');
                if (!li) return;
                var index = parseInt(li.getAttribute('data-index'), 10);
                var listKey = li.getAttribute('data-list');
                var action = btn.getAttribute('data-action');
                if (isNaN(index)) return;
                if (action === 'delete') deleteFilm(user, listKey, index);
                else if (action === 'restore') restoreFilm(user, index);
            });
        });
    }

    /* ---------------- Привязка событий ---------------- */

    function bindEvents() {
        // 1. Выбор пользователя
        var userButtons = Array.prototype.slice.call(document.querySelectorAll('.user-btn'));
        userButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var user = btn.getAttribute('data-user');
                if (USER_KEYS.indexOf(user) === -1) return;
                selectedUser = user;
                clearPickResult();
                setRouletteText('Выбран: ' + USER_LABELS[user] + '. Жмите «Выбрать случайный фильм»', 'idle');
                renderUserButtons();
                renderPanel(user);
                updatePickButton();
                toast('Выбран ' + USER_LABELS[user] + '. К просмотру: ' + state[user].films.length +
                    ', просмотрено: ' + state[user].watched.length + '.', 'info', 2800);
            });
        });

        // 2. Случайный фильм
        els.pickBtn.addEventListener('click', pickRandomFilm);

        // 4. Показ просмотренных (Y/N)
        els.showWatchedBtn.addEventListener('click', function () {
            if (watchedPanelShown) {
                watchedPanelShown = false;
                els.watchedPanel.hidden = true;
                els.showWatchedBtn.textContent = '👀 Показать просмотренные фильмы';
                toast('Список просмотренных фильмов скрыт.', 'info', 2600);
                return;
            }

            confirmDialog({
                title: 'Показать просмотренные фильмы?',
                text: 'Want to see a list of watched movies? (Y/N)',
                yesText: 'Да (Y)',
                noText: 'Нет (N)'
            }).then(function (yes) {
                if (yes) {
                    watchedPanelShown = true;
                    renderWatchedPanel();
                    els.watchedPanel.hidden = false;
                    els.showWatchedBtn.textContent = '🙈 Скрыть просмотренные фильмы';
                    if (totalWatched() === 0) {
                        toast('Просмотренных фильмов пока нет ни у одного пользователя.', 'warn', 4000);
                    } else {
                        toast('Показаны списки просмотренных фильмов (только непустые).', 'success', 3200);
                    }
                    els.watchedPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    watchedPanelShown = false;
                    els.watchedPanel.hidden = true;
                    toast('Список просмотренных фильмов не будет показан.', 'info', 3800);
                }
            });
        });

        // 5. Экспорт / импорт / сброс
        els.exportJsonBtn.addEventListener('click', exportJson);
        els.exportTxtBtn.addEventListener('click', exportTxt);
        els.resetBtn.addEventListener('click', resetAll);

        els.importFile.addEventListener('change', function (e) {
            var input = e.target;
            var file = input.files && input.files[0];
            if (!file) return;

            var reader = new FileReader();

            reader.onload = function (ev) {
                var text = String(ev && ev.target && ev.target.result != null ? ev.target.result : '');
                importFromText(text, file.name);
                input.value = '';
            };

            reader.onerror = function () {
                toast('Не удалось прочитать файл «' + file.name + '».', 'error');
                input.value = '';
            };

            reader.readAsText(file, 'UTF-8');
        });

        // Модальное окно
        els.modalYes.addEventListener('click', function () { closeModal(true); });
        els.modalNo.addEventListener('click', function () { closeModal(false); });
        els.modalOverlay.addEventListener('click', function (e) {
            if (e.target === els.modalOverlay) closeModal(false);
        });

        // Горячие клавиши
        document.addEventListener('keydown', function (e) {
            if (!els.modalOverlay.hidden) {
                if (e.key === 'Escape') { e.preventDefault(); closeModal(false); }
                else if (e.key === 'Enter') { e.preventDefault(); closeModal(true); }
                return;
            }

            var isSpace = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';
            if (!isSpace) return;

            var t = e.target;
            var tag = t && t.tagName ? t.tagName.toLowerCase() : '';
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable)) return;
            if (tag === 'button' || tag === 'a' || tag === 'summary') return;

            e.preventDefault();
            pickRandomFilm();
        });
    }

    /* ---------------- Кэш DOM ---------------- */

    function cacheDom() {
        els.toastContainer = document.getElementById('toastContainer');
        els.modalOverlay = document.getElementById('modalOverlay');
        els.modalTitle = document.getElementById('modalTitle');
        els.modalText = document.getElementById('modalText');
        els.modalYes = document.getElementById('modalYes');
        els.modalNo = document.getElementById('modalNo');
        els.userSection = document.getElementById('userSection');
        els.totalFilms = document.getElementById('totalFilms');
        els.totalWatched = document.getElementById('totalWatched');
        els.u1FilmsCount = document.getElementById('u1FilmsCount');
        els.u1WatchedCount = document.getElementById('u1WatchedCount');
        els.u2FilmsCount = document.getElementById('u2FilmsCount');
        els.u2WatchedCount = document.getElementById('u2WatchedCount');
        els.rouletteTitle = document.getElementById('rouletteTitle');
        els.pickBtn = document.getElementById('pickBtn');
        els.pickResult = document.getElementById('pickResult');
        els.pickResultName = document.getElementById('pickResultName');
        els.pickResultMeta = document.getElementById('pickResultMeta');
        els.historyBox = document.getElementById('historyBox');
        els.historyList = document.getElementById('historyList');
        els.listsGrid = document.getElementById('listsGrid');
        els.showWatchedBtn = document.getElementById('showWatchedBtn');
        els.watchedPanel = document.getElementById('watchedPanel');
        els.watchedColumns = document.getElementById('watchedColumns');
        els.watchedEmptyNote = document.getElementById('watchedEmptyNote');
        els.exportJsonBtn = document.getElementById('exportJsonBtn');
        els.exportTxtBtn = document.getElementById('exportTxtBtn');
        els.importFile = document.getElementById('importFile');
        els.txtTarget = document.getElementById('txtTarget');
        els.txtAppend = document.getElementById('txtAppend');
        els.resetBtn = document.getElementById('resetBtn');
        els.storageBadge = document.getElementById('storageBadge');
    }

    /* ---------------- Инициализация ---------------- */

    function init() {
        cacheDom();

        storageOk = checkStorage();
        if (!storageOk) els.storageBadge.hidden = false;

        state = loadState();
        history = loadHistory();

        buildPanels();
        bindEvents();
        renderAll();

        setRouletteText('Сначала выберите пользователя, затем нажмите кнопку ниже', 'idle');

        // фиксируем состояние в хранилище при первом запуске
        persist();

        if (!storageOk) {
            toast('localStorage недоступен (часто бывает на file://) — работаем в оперативной памяти.', 'warn', 7000);
        } else {
            toast('Данные загружены из localStorage. Выберите пользователя и нажмите «Выбрать случайный фильм».', 'info', 4200);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();