const script = async () => {
    await WA.onInit();
    await WA.players.configureTracking({
        players: true,
        movement: false,
    });

    //////////////////////////////////
    ///////// Welcome dialog /////////
    //////////////////////////////////
    let firstTime = true;
    let isTrash = false;
    let language = 'en';
    let helloWorldPopup;

    // https://v2.jokeapi.dev/joke/Any?blacklistFlags=racist,sexist
    WA.room.onEnterLayer("Trigger/Welcome").subscribe(() => {
        if (firstTime) {
            helloWorldPopup = WA.ui.openPopup("WelcomePopup", 'Welcome to Pulsar Systems Office !', []);
            firstTime = false;
        } else {
            const availableLanguages = [
                { label: 'English', symbol: 'en' },
                { label: 'French', symbol: 'fr' },
                { label: 'Spanish', symbol: 'es' },
            ].filter(l => l.symbol !== language);

            const buttons = [...availableLanguages.map(l => ({
                    label: l.label,
                    className: "primary",
                    callback: (popup) => {
                        language = l.symbol;
                        popup.close();
                    }
                })), {
                label: isTrash ? 'Soft mode' : 'Trash mode',
                className: "primary",
                callback: (popup) => {
                    isTrash = !isTrash;
                    popup.close();
                }
            }];

            fetch(`https://v2.jokeapi.dev/joke/Any?lang=${language}&blacklistFlags=${isTrash ? '' : 'racist,sexist,explicit'}`)
                .then(d => d.json())
                .then(res => {
                    if (res.type === 'twopart') {
                        helloWorldPopup = WA.ui.openPopup("WelcomePopup", res.setup, []);
                        setTimeout(() => {
                            helloWorldPopup.close();
                            helloWorldPopup = WA.ui.openPopup("WelcomePopup", res.delivery, buttons);
                        }, 4000);
                    } else {
                        helloWorldPopup = WA.ui.openPopup("WelcomePopup", res.joke, buttons);
                    }
                });
        }
    });

    WA.room.onLeaveLayer("Trigger/Welcome").subscribe(() => {
        helloWorldPopup.close();
    });

    //////////////////////////////////
    ///////////// Juckbox ////////////
    //////////////////////////////////
    const juckbox = WA.room.area.create({
        name: 'Juckbox',
        x: 741,
        y: 760,
        width: 436,
        height: 229,
    });
    // juckbox.setProperty('playAudio', 'music/gangnam-style.mp3');
    /*juckbox.setProperty('playAudio', 'music/jimmy-punchline.mp3');
    setTimeout(() => {
        juckbox.setProperty('playAudio', undefined);
    }, 16000);*/

    const songList = [
        { name: 'Jimmy Punchline', file: 'music/jimmy-punchline.mp3' },
        { name: 'Gangnam Style', file: 'music/gangnam-style.mp3' },
    ]

    let juckboxPopup;
    let timeoutDisco;
    WA.room.onEnterLayer("Trigger/Jukebox").subscribe(() => {
        // juckbox.setProperty('playAudio', 'music/jimmy-punchline.mp3');
        juckboxPopup = WA.ui.openPopup("JukeboxPopup", 'Jukebox', [...songList.map(song => ({
                label: song.name,
                className: "primary",
                callback: (popup) => {
                    juckbox.setProperty('playAudio', song.file);
                    WA.room.showLayer("disco");
                    clearTimeout(timeoutDisco);
                    timeoutDisco = setTimeout(() => WA.room.hideLayer("disco"), 20000);
                    // Trigger update for other users
                    WA.player.state.saveVariable("Jukebox", song.file, {
                        public: true,
                        persist: false,
                        scope: "room",
                    });
                    popup.close();
                }
            })), {
                label: 'Stop',
                className: "primary",
                callback: (popup) => {
                    juckbox.setProperty('playAudio', undefined);
                    WA.room.hideLayer("disco");

                    // Trigger update for other users
                    WA.player.state.saveVariable("Jukebox", undefined, {
                        public: true,
                        persist: false,
                        scope: "room",
                    });
                    popup.close();
                }
            }]
        );
    });

    WA.room.onLeaveLayer("Trigger/Jukebox").subscribe(() => {
        juckboxPopup.close();
    });

    WA.players.onVariableChange("Jukebox").subscribe((event) => {
        // Apply update to other users
        juckbox.setProperty('playAudio', event.value);

        if (event.value) {
            WA.room.showLayer("disco");
            clearTimeout(timeoutDisco);
            timeoutDisco = setTimeout(() => WA.room.hideLayer("disco"), 20000);
        } else {
            WA.room.hideLayer("disco");
        }
    });
}
script().then();
