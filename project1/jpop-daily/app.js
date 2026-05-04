document.addEventListener('DOMContentLoaded', () => {
    // 預設的日系流行歌曲資料庫
    const songs = [
        { id: 'ZRtdQ81jPUQ', title: 'アイドル (Idol)', artist: 'YOASOBI', genre: 'J-Pop' },
        { id: 'M2cckDmNLMI', title: 'KICK BACK', artist: '米津玄師 (Kenshi Yonezu)', genre: 'Rock/Anime' },
        { id: 'Qp3b-RXtz4w', title: 'うっせぇわ (Usseewa)', artist: 'Ado', genre: 'Pop/Vocaloid' },
        { id: 'CwkzK-F0Y00', title: '紅蓮華 (Gurenge)', artist: 'LiSA', genre: 'Rock/Anime' },
        { id: 'TQ8WlA2GXbk', title: 'Pretender', artist: 'Official髭男dism', genre: 'Pop' },
        { id: 'o0Gk-xS687Y', title: '死ぬのがいいわ (Shinunoga E-Wa)', artist: '藤井風 (Fujii Kaze)', genre: 'R&B/Pop' },
        { id: 'UM9XNOexcGw', title: '怪獣の花唄 (Kaiju no Hanauta)', artist: 'Vaundy', genre: 'Pop/Rock' },
        { id: 'kzZ6KXENPR8', title: 'ドライフラワー (Dry Flower)', artist: '優里 (Yuuri)', genre: 'Acoustic/Pop' },
        { id: '0xWi8jO7-HE', title: 'マリーゴールド (Marigold)', artist: 'あいみょん (Aimyon)', genre: 'Pop' },
        { id: 'tLQLa6lM3Us', title: '残響散歌 (Zankyosanka)', artist: 'Aimer', genre: 'Pop/Anime' },
        { id: 'mneasQYEQNU', title: '踊 (Odo)', artist: 'Ado', genre: 'EDM/Pop' },
        { id: '1FliVTvWn4M', title: '唱 (Show)', artist: 'Ado', genre: 'EDM/Pop' },
        { id: 'dFlKUyRhvdA', title: 'Lemon', artist: '米津玄師 (Kenshi Yonezu)', genre: 'Pop' },
        { id: 'x8VYWazR5mE', title: '夜に駆ける (Yoru ni Kakeru)', artist: 'YOASOBI', genre: 'Pop' },
        { id: 'PqJNc9KVIZE', title: 'Subtitle', artist: 'Official髭男dism', genre: 'Pop/Ballad' }
    ];

    let dayOffset = 0; // 用於預覽未來的推薦

    function renderDailySongs() {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + dayOffset);
        
        // 更新日期標題
        const dateString = targetDate.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'long' });
        const todayTitle = document.getElementById('today-date');
        
        if (dayOffset === 0) {
            todayTitle.textContent = '今天';
        } else if (dayOffset === 1) {
            todayTitle.textContent = '明天';
        } else {
            todayTitle.textContent = dateString;
        }

        // 根據日期計算 Seed (讓同一天產生的推薦歌曲是固定的)
        const seed = Math.floor(targetDate.getTime() / 86400000); 
        
        // 選擇3首歌 (簡單演算法)
        const songsCount = songs.length;
        const dailySongs = [
            songs[(seed) % songsCount],
            songs[(seed * 2 + 1) % songsCount],
            songs[(seed * 3 + 2) % songsCount]
        ];

        // 避免重複歌曲的機制 (若有衝突則往下找)
        if(dailySongs[1].id === dailySongs[0].id) {
            dailySongs[1] = songs[(seed * 2 + 2) % songsCount];
        }
        if(dailySongs[2].id === dailySongs[0].id || dailySongs[2].id === dailySongs[1].id) {
            dailySongs[2] = songs[(seed * 3 + 4) % songsCount];
        }

        const container = document.getElementById('music-container');
        container.innerHTML = ''; // 清空目前的內容

        // 生成卡片
        dailySongs.forEach((song) => {
            const card = document.createElement('div');
            card.className = 'card animate-card';
            
            card.innerHTML = `
                <div class="video-wrapper">
                    <iframe src="https://www.youtube.com/embed/${song.id}?rel=0" 
                            title="${song.title}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                    <span class="song-genre">${song.genre}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // 初始化載入
    renderDailySongs();

    // 換一組推薦的按鈕事件
    document.getElementById('refresh-btn').addEventListener('click', () => {
        dayOffset++;
        renderDailySongs();
    });
});
