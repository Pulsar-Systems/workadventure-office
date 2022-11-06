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
    let inZone;

    const birthdays = new Map([
        ['Umair', { month: 2, day: 1 }],
        ['Hugo', { month: 2, day: 14 }],
        ['Anton', { month: 2, day: 22 }],
        ['Darine', { month: 3, day: 20 }],
        ['Ali', { month: 5, day: 15 }],
        ['Antoine', { month: 5, day: 26 }],
        ['Cloe', { month: 7, day: 16 }],
        ['Alex', { month: 7, day: 22 }],
        ['Vincent', { month: 8, day: 23 }],
        ['Vivi', { month: 10, day: 4 }],
        ['Polina', { month: 11, day: 7 }],
        // ['Gregance', { month: 12, day: 17 }],
        ['Gregance', { month: 11, day: 6 }],
    ]);

    const date = new Date();
    const userBirthday = birthdays.get(WA.player.name);
    const isBirthday = userBirthday && userBirthday.month === (date.getMonth() + 1) && userBirthday.day === date.getDate();
    if (isBirthday) {
        WA.room.showLayer('birthday');
    }

    // https://v2.jokeapi.dev/joke/Any?blacklistFlags=racist,sexist
    WA.room.onEnterLayer("Trigger/Welcome").subscribe(() => {
        inZone = true;
        if (firstTime) {
            if (isBirthday) {
                helloWorldPopup = WA.ui.openPopup("WelcomePopup", `Happy birthday ${WA.player.name}`, []);
            } else {
                helloWorldPopup = WA.ui.openPopup("WelcomePopup", 'Welcome to Pulsar Systems Office !', []);
            }
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
                    if (inZone) {
                        if (res.type === 'twopart') {
                            helloWorldPopup = WA.ui.openPopup("WelcomePopup", res.setup, []);
                            setTimeout(() => {
                                helloWorldPopup.close();
                                if (inZone) {
                                    helloWorldPopup = WA.ui.openPopup("WelcomePopup", res.delivery, buttons);
                                }
                            }, 4000);
                        } else {
                            helloWorldPopup = WA.ui.openPopup("WelcomePopup", res.joke, buttons);
                        }
                    }
                });
        }
    });

    WA.room.onLeaveLayer("Trigger/Welcome").subscribe(() => {
        inZone = false;
        if (isBirthday) {
            WA.room.hideLayer('birthday');
        }
        helloWorldPopup.close();
    });

    //////////////////////////////////
    ////////////// Admin /////////////
    //////////////////////////////////
    const admins = ['Gregance'];

    const happyBirthdaySound = WA.sound.loadSound('music/happy-birthday.mp3');
    if (admins.includes(WA.player.name)) {
        WA.ui.registerMenuCommand('Happy birthday', {
            callback: () => {
                happyBirthdaySound.play({});
                WA.player.state.saveVariable("HappyBirthdaySong", true, {
                    public: true,
                    persist: false,
                    scope: "room",
                });
            }
        });
        WA.ui.registerMenuCommand('Happy birthday stop', {
            callback: () => {
                happyBirthdaySound.stop();
                WA.player.state.saveVariable("HappyBirthdaySong", false, {
                    public: true,
                    persist: false,
                    scope: "room",
                });
            }
        });
    }

    WA.players.onVariableChange("HappyBirthdaySong").subscribe((event) => {
        if (event.value) {
            happyBirthdaySound.play({});
        } else {
            happyBirthdaySound.stop();
        }
    });

    //////////////////////////////////
    ///////////// Jukebox ////////////
    //////////////////////////////////
    const jukebox = WA.room.area.create({
        name: 'Jukebox',
        x: 741,
        y: 760,
        width: 436,
        height: 235,
    });

    WA.players.onVariableChange("Jukebox").subscribe((event) => {
        console.log('Jukebox change = ', event.value);
        // Apply update to other users
        jukebox.setProperty('playAudio', event.value);
        if (!event.value) {
            WA.room.hideLayer("disco");
        }
    });

    /*WA.players.onVariableChange("Disco").subscribe((event) => {
        // Apply update to other users
        WA.room.showLayer("disco");
        timeoutDisco && clearTimeout(timeoutDisco);
        timeoutDisco = setTimeout(() => {
            WA.room.hideLayer("disco");
            timeoutDisco = undefined;
        }, 20000);
    });*/
    // The rest is managed in dialog-jukebox.html
}
script().then();
