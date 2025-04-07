document.addEventListener('DOMContentLoaded', function() {
    // 初始化变量
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let map;
    let currentRoute;
    
    // 初始化页面
    initPage();
    
    // 页面初始化函数
    function initPage() {
        // 显示用户名
        if (currentUser) {
            document.getElementById('username-display').textContent = currentUser.username;
            document.getElementById('user-fullname').textContent = currentUser.name || currentUser.username;
            document.getElementById('user-bio').textContent = currentUser.bio || '暂无个人简介';
        }
        
        // 初始化高德地图
        initMap();
        
        // 加载推荐景点
        loadRecommendedSpots();
        
        // 加载热门日记
        loadPopularDiaries();
        
        // 加载我的日记
        loadMyDiaries();
        
        // 加载推荐用户
        loadRecommendedUsers();
        
        // 加载景点下拉列表
        loadSpotOptions();
    }
    
    // 初始化高德地图
    function initMap() {
        map = new AMap.Map('map-container', {
            zoom: 12,
            center: [116.397428, 39.90923] // 默认北京中心点
        });
    }
    
    // 加载推荐景点
    function loadRecommendedSpots() {
        // 这里应该是从后端API获取数据
        // 模拟数据
        const spots = [
            { id: 1, name: '故宫', image: 'https://via.placeholder.com/300x200?text=故宫', rating: 4.8, description: '北京故宫是中国明清两代的皇家宫殿，旧称紫禁城。' },
            { id: 2, name: '长城', image: 'https://via.placeholder.com/300x200?text=长城', rating: 4.9, description: '长城是中国古代的军事防御工程，也是世界文化遗产。' },
            { id: 3, name: '颐和园', image: 'https://via.placeholder.com/300x200?text=颐和园', rating: 4.7, description: '颐和园是保存最完整的一座皇家行宫御苑，被誉为"皇家园林博物馆"。' },
            { id: 4, name: '天坛', image: 'https://via.placeholder.com/300x200?text=天坛', rating: 4.6, description: '天坛是明清两朝帝王祭天、祈谷的场所，是现存中国古代规模最大、伦理等级最高的祭祀建筑群。' }
        ];
        
        const container = document.getElementById('recommended-spots');
        container.innerHTML = '';
        
        spots.forEach(spot => {
            const spotElement = document.createElement('div');
            spotElement.className = 'col-md-6';
            spotElement.innerHTML = `
                <div class="card spot-card" data-id="${spot.id}">
                    <img src="${spot.image}" class="card-img-top spot-image" alt="${spot.name}">
                    <div class="card-body">
                        <h5 class="card-title">${spot.name}</h5>
                        <div class="rating">${'★'.repeat(Math.floor(spot.rating))}${'☆'.repeat(5-Math.floor(spot.rating))} ${spot.rating}</div>
                        <p class="card-text">${spot.description.substring(0, 50)}...</p>
                    </div>
                </div>
            `;
            container.appendChild(spotElement);
            
            // 添加点击事件
            spotElement.querySelector('.spot-card').addEventListener('click', function() {
                showSpotDetail(spot.id);
            });
        });
    }
    
    // 显示景点详情
    function showSpotDetail(spotId) {
        // 这里应该是从后端API获取数据
        // 模拟数据
        const spot = {
            id: spotId,
            name: '故宫',
            image: 'https://via.placeholder.com/800x500?text=故宫',
            description: '北京故宫是中国明清两代的皇家宫殿，旧称紫禁城，位于北京中轴线的中心，是中国古代宫廷建筑之精华。北京故宫以三大殿为中心，占地面积72万平方米，建筑面积约15万平方米，有大小宫殿七十多座，房屋九千余间。是世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
            address: '北京市东城区景山前街4号',
            openingHours: '08:30-17:00 (4月1日-10月31日), 08:30-16:30 (11月1日-3月31日)',
            ticket: '旺季60元, 淡季40元',
            rating: 4.8
        };
        
        // 填充模态框内容
        document.getElementById('spot-modal-title').textContent = spot.name;
        document.getElementById('spot-modal-image').src = spot.image;
        document.getElementById('spot-modal-description').textContent = spot.description;
        document.getElementById('spot-modal-address').textContent = spot.address;
        document.getElementById('spot-modal-opening-hours').textContent = spot.openingHours;
        document.getElementById('spot-modal-ticket').textContent = spot.ticket;
        document.getElementById('spot-modal-rating').innerHTML = `${'★'.repeat(Math.floor(spot.rating))}${'☆'.repeat(5-Math.floor(spot.rating))} ${spot.rating}`;
        
        // 加载相关日记
        loadRelatedDiaries(spotId, 'spot-related-diaries');
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('spot-detail-modal'));
        modal.show();
    }
    
    // 加载热门日记
    function loadPopularDiaries() {
        // 这里应该是从后端API获取数据
        // 模拟数据
        const diaries = [
            { id: 1, title: '故宫一日游', author: '张三', date: '2023-05-15', content: '今天去了故宫，人真的好多啊...', likes: 24 },
            { id: 2, title: '长城徒步记', author: '李四', date: '2023-04-22', content: '爬长城真的很累，但是风景太美了...', likes: 18 },
            { id: 3, title: '颐和园春游', author: '王五', date: '2023-03-10', content: '春天的颐和园真是太美了...', likes: 15 }
        ];
        
        const container = document.getElementById('popular-diaries');
        container.innerHTML = '';
        
        diaries.forEach(diary => {
            const diaryElement = document.createElement('div');
            diaryElement.className = 'diary-item';
            diaryElement.innerHTML = `
                <h5>${diary.title}</h5>
                <small class="text-muted">作者: ${diary.author} | 日期: ${diary.date} | 点赞: ${diary.likes}</small>
                <p>${diary.content.substring(0, 100)}...</p>
            `;
            container.appendChild(diaryElement);
            
            // 添加点击事件
            diaryElement.addEventListener('click', function() {
                showDiaryDetail(diary.id);
            });
        });
    }
    
    // 显示日记详情
    function showDiaryDetail(diaryId) {
        // 这里应该是从后端API获取数据
        // 模拟数据
        const diary = {
            id: diaryId,
            title: '故宫一日游',
            author: '张三',
            date: '2023-05-15',
            content: '今天去了故宫，人真的好多啊，但是建筑真的太壮观了。早上8点就到达了天安门广场，排队的人已经很多了。进入故宫后，首先参观了太和殿，金碧辉煌的宫殿让人震撼。中午在故宫餐厅吃了饭，价格有点贵但味道还不错。下午参观了珍宝馆，看到了很多珍贵的文物。一天下来虽然很累，但是非常值得。',
            likes: 24,
            images: [
                'https://via.placeholder.com/400x300?text=故宫照片1',
                'https://via.placeholder.com/400x300?text=故宫照片2'
            ],
            relatedSpots: [1]
        };
        
        // 填充模态框内容
        document.getElementById('diary-modal-title').textContent = diary.title;
        document.getElementById('diary-modal-author').textContent = `作者: ${diary.author}`;
        document.getElementById('diary-modal-date').textContent = `日期: ${diary.date}`;
        document.getElementById('diary-modal-content').innerHTML = `<p>${diary.content.replace(/\n/g, '</p><p>')}</p>`;
        
        // 加载图片
        const imagesContainer = document.getElementById('diary-modal-images');
        imagesContainer.innerHTML = '';
        if (diary.images && diary.images.length > 0) {
            const row = document.createElement('div');
            row.className = 'row';
            diary.images.forEach(image => {
                const col = document.createElement('div');
                col.className = 'col-md-6 mb-3';
                col.innerHTML = `<img src="${image}" class="img-fluid rounded" alt="日记图片">`;
                row.appendChild(col);
            });
            imagesContainer.appendChild(row);
        }
        
        // 加载相关景点
        loadRelatedSpots(diary.relatedSpots, 'diary-related-spots');
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('diary-detail-modal'));
        modal.show();
    }
    
    // 加载我的日记
    function loadMyDiaries() {
        if (!currentUser) return;
        
        // 这里应该是从后端API获取数据
        // 模拟数据
        const diaries = [
            { id: 4, title: '我的长城之旅', date: '2023-06-10', content: '今天终于实现了爬长城的梦想...', likes: 8 },
            { id: 5, title: '颐和园游记', date: '2023-05-28', content: '颐和园的昆明湖真是太美了...', likes: 5 }
        ];
        
        const container = document.getElementById('my-diaries');
        container.innerHTML = '';
        
        if (diaries.length === 0) {
            container.innerHTML = '<p>你还没有写过日记，点击"写日记"按钮开始记录吧！</p>';
            return;
        }
        
        diaries.forEach(diary => {
            const diaryElement = document.createElement('div');
            diaryElement.className = 'diary-item';
            diaryElement.innerHTML = `
                <h5>${diary.title}</h5>
                <small class="text-muted">日期: ${diary.date} | 点赞: ${diary.likes}</small>
                <p>${diary.content.substring(0, 100)}...</p>
            `;
            container.appendChild(diaryElement);
            
            // 添加点击事件
            diaryElement.addEventListener('click', function() {
                showDiaryDetail(diary.id);
            });
        });
    }
    
    // 加载推荐用户
    function loadRecommendedUsers() {
        // 这里应该是从后端API获取数据
        // 模拟数据
        const users = [
            { id: 2, username: 'travel_lover', name: '李四', avatar: 'https://via.placeholder.com/100?text=李四' },
            { id: 3, username: 'photo_master', name: '王五', avatar: 'https://via.placeholder.com/100?text=王五' },
            { id: 4, username: 'food_explorer', name: '赵六', avatar: 'https://via.placeholder.com/100?text=赵六' }
        ];
        
        const container = document.getElementById('recommended-users');
        container.innerHTML = '';
        
        users.forEach(user => {
            const userElement = document.createElement('a');
            userElement.href = '#';
            userElement.className = 'list-group-item list-group-item-action';
            userElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${user.avatar}" class="rounded-circle me-3" width="40" height="40" alt="${user.name}">
                    <div>
                        <h6 class="mb-0">${user.name}</h6>
                        <small class="text-muted">@${user.username}</small>
                    </div>
                </div>
            `;
            container.appendChild(userElement);
        });
    }
    
    // 加载景点下拉列表
    function loadSpotOptions() {
        // 这里应该是从后端API获取数据
        // 模拟数据
        const spots = [
            { id: 1, name: '故宫' },
            { id: 2, name: '长城' },
            { id: 3, name: '颐和园' },
            { id: 4, name: '天坛' }
        ];
        
        const select = document.getElementById('diary-spot');
        spots.forEach(spot => {
            const option = document.createElement('option');
            option.value = spot.id;
            option.textContent = spot.name;
            select.appendChild(option);
        });
    }
    
    // 加载相关日记
    function loadRelatedDiaries(spotId, containerId) {
        // 这里应该是从后端API获取数据
        // 模拟数据
        const diaries = [
            { id: 1, title: '故宫一日游', author: '张三', date: '2023-05-15', excerpt: '今天去了故宫，人真的好多啊...' },
            { id: 6, title: '故宫摄影记', author: '钱七', date: '2023-04-05', excerpt: '在故宫拍了很多漂亮的照片...' }
        ];
        
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if (diaries.length === 0) {
            container.innerHTML = '<p>暂无相关日记</p>';
            return;
        }
        
        diaries.forEach(diary => {
            const diaryElement = document.createElement('div');
            diaryElement.className = 'mb-2';
            diaryElement.innerHTML = `
                <h6><a href="#" class="text-decoration-none diary-link" data-id="${diary.id}">${diary.title}</a></h6>
                <small class="text-muted">作者: ${diary.author} | 日期: ${diary.date}</small>
                <p class="mb-0">${diary.excerpt}</p>
            `;
            container.appendChild(diaryElement);
            
            // 添加点击事件
            diaryElement.querySelector('.diary-link').addEventListener('click', function(e) {
                e.preventDefault();
                showDiaryDetail(diary.id);
            });
        });
    }
    
    // 加载相关景点
    function loadRelatedSpots(spotIds, containerId) {
        // 这里应该是从后端API获取数据
        // 模拟数据
        const allSpots = [
            { id: 1, name: '故宫' },
            { id: 2, name: '长城' },
            { id: 3, name: '颐和园' },
            { id: 4, name: '天坛' }
        ];
        
        const spots = allSpots.filter(spot => spotIds.includes(spot.id));
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if (spots.length === 0) {
            container.innerHTML = '<p>未关联景点</p>';
            return;
        }
        
        spots.forEach(spot => {
            const spotElement = document.createElement('div');
            spotElement.className = 'mb-2';
            spotElement.innerHTML = `
                <a href="#" class="text-decoration-none spot-link" data-id="${spot.id}">${spot.name}</a>
            `;
            container.appendChild(spotElement);
            
            // 添加点击事件
            spotElement.querySelector('.spot-link').addEventListener('click', function(e) {
                e.preventDefault();
                showSpotDetail(spot.id);
            });
        });
    }
    
    // 规划路线
    function planRoute(start, end, mode) {
        // 清除现有路线
        if (currentRoute) {
            map.remove(currentRoute);
        }
        
        // 这里应该调用后端API计算最短路径
        // 模拟数据 - 实际应用中应该使用高德地图API或后端计算的最短路径
        const route = {
            path: [
                [116.397428, 39.90923], // 起点
                [116.407428, 39.90923],
                [116.417428, 39.90923],
                [116.427428, 39.90923],
                [116.437428, 39.91923], // 终点
            ],
            distance: '15.6公里',
            time: '45分钟'
        };
        
        // 绘制路线
        currentRoute = new AMap.Polyline({
            path: route.path,
            isOutline: true,
            outlineColor: '#ffeeff',
            borderWeight: 1,
            strokeColor: '#3366FF', 
            strokeOpacity: 1,
            strokeWeight: 6,
            strokeStyle: 'solid',
            strokeDasharray: [10, 5],
            lineJoin: 'round',
            lineCap: 'round',
            zIndex: 50
        });
        
        map.add(currentRoute);
        map.setFitView(currentRoute);
        
        // 显示路线信息
        document.getElementById('route-info').innerHTML = `
            <div class="alert alert-info">
                <strong>路线信息:</strong> 距离 ${route.distance}，预计耗时 ${route.time}
            </div>
        `;
    }
    
    // 事件监听
    
    // 导航栏切换
    document.getElementById('home-tab').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('home-content').style.display = 'block';
        document.getElementById('diary-content').style.display = 'none';
        document.getElementById('route-content').style.display = 'none';
        
        // 更新active状态
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    });
    
    document.getElementById('diary-tab').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('home-content').style.display = 'none';
        document.getElementById('diary-content').style.display = 'block';
        document.getElementById('route-content').style.display = 'none';
        
        // 更新active状态
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    });
    
    document.getElementById('route-tab').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('home-content').style.display = 'none';
        document.getElementById('diary-content').style.display = 'none';
        document.getElementById('route-content').style.display = 'block';
        
        // 更新active状态
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    });
    
    // 景点搜索
    document.getElementById('spot-search-btn').addEventListener('click', function() {
        const keyword = document.getElementById('spot-search-input').value.trim();
        if (keyword === '') {
            alert('请输入搜索关键词');
            return;
        }
        
        // 这里应该是从后端API获取数据
        // 模拟数据
        const results = [
            { id: 1, name: '故宫', description: '北京故宫是中国明清两代的皇家宫殿' },
            { id: 2, name: '长城', description: '长城是中国古代的军事防御工程' }
        ];
        
        const container = document.getElementById('search-results');
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<div class="list-group-item">没有找到相关景点</div>';
            return;
        }
        
        results.forEach(spot => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <h5>${spot.name}</h5>
                <p class="mb-0">${spot.description}</p>
            `;
            container.appendChild(item);
            
            // 添加点击事件
            item.addEventListener('click', function(e) {
                e.preventDefault();
                showSpotDetail(spot.id);
            });
        });
    });
    
    // 日记搜索
    document.getElementById('diary-search-btn').addEventListener('click', function() {
        const keyword = document.getElementById('diary-search-input').value.trim();
        if (keyword === '') {
            alert('请输入搜索关键词');
            return;
        }
        
        // 这里应该是从后端API获取数据
        // 模拟数据
        const results = [
            { id: 1, title: '故宫一日游', author: '张三', date: '2023-05-15', excerpt: '今天去了故宫，人真的好多啊...' },
            { id: 6, title: '故宫摄影记', author: '钱七', date: '2023-04-05', excerpt: '在故宫拍了很多漂亮的照片...' }
        ];
        
        const container = document.getElementById('diary-search-results');
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<div class="list-group-item">没有找到相关日记</div>';
            return;
        }
        
        results.forEach(diary => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <h5>${diary.title}</h5>
                <small class="text-muted">作者: ${diary.author} | 日期: ${diary.date}</small>
                <p class="mb-0">${diary.excerpt}</p>
            `;
            container.appendChild(item);
            
            // 添加点击事件
            item.addEventListener('click', function(e) {
                e.preventDefault();
                showDiaryDetail(diary.id);
            });
        });
    });
    
    // 提交日记表单
    document.getElementById('diary-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('diary-title').value.trim();
        const content = document.getElementById('diary-content-input').value.trim();
        const spotId = document.getElementById('diary-spot').value;
        
        if (title === '' || content === '') {
            alert('请填写标题和内容');
            return;
        }
        
        // 这里应该调用后端API保存日记
        // 模拟保存
        alert('日记保存成功！');
        
        // 清空表单
        this.reset();
        
        // 刷新我的日记列表
        loadMyDiaries();
    });
    
    // 提交路线规划表单
    document.getElementById('route-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const start = document.getElementById('start-point').value.trim();
        const end = document.getElementById('end-point').value.trim();
        const mode = document.getElementById('travel-mode').value;
        
        if (start === '' || end === '') {
            alert('请输入起点和终点');
            return;
        }
        
        // 规划路线
        planRoute(start, end, mode);
    });
    
    // 退出登录
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html'; // 返回到登录页面
    });
    
    // 收藏景点
    document.getElementById('add-to-favorites-btn').addEventListener('click', function() {
        // 这里应该调用后端API收藏景点
        alert('已添加到收藏夹！');
    });
})