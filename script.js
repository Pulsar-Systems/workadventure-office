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
    ///////////// Jukebox ////////////
    //////////////////////////////////
    WA.room.area.create({
        name: 'Jukebox',
        x: 741,
        y: 760,
        width: 436,
        height: 235,
    });
    // The rest is managed in dialog-jukebox.html
}
script().then();
