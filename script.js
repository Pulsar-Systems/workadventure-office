const script = async () => {
    await WA.onInit();
    await WA.players.configureTracking({
        players: true,
        movement: false,
    });

    //////////////////////////////////
    ///////// Welcome dialog /////////
    //////////////////////////////////
    let helloWorldPopup;
    const welcomeSubscriber = WA.room.onEnterLayer("Trigger/Welcome").subscribe(() => {
        helloWorldPopup = WA.ui.openPopup("WelcomePopup", 'Welcome to Pulsar Systems Office !', []);
    });

    WA.room.onLeaveLayer("Trigger/Welcome").subscribe(() => {
        helloWorldPopup.close();
        welcomeSubscriber.unsubscribe();
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
    WA.room.onEnterLayer("Trigger/Jukebox").subscribe(() => {
        // juckbox.setProperty('playAudio', 'music/jimmy-punchline.mp3');
        juckboxPopup = WA.ui.openPopup("JukeboxPopup", 'Jukebox', [...songList.map(song => ({
                label: song.name,
                className: "primary",
                callback: (popup) => {
                    juckbox.setProperty('playAudio', song.file);
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
    });
}
script().then();
