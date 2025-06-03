document.addEventListener('DOMContentLoaded', function() {
    // 初始化变量
     let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // let currentUser = {
    //                 username:"街口施法老太",
    //                 signature:"为有牺牲多壮志，敢叫日月换新天",
    //                 avatar: "./images/御用头像.jpg"
    //             };
    //console.log(currentUser);
    let map;
    let currentRoute;
    
    // 初始化页面
    initPage();
    
    // 页面初始化函数
    function initPage() {
        // 显示用户名
        if (currentUser) {
            document.getElementById('username-display').textContent = currentUser.username;
            document.getElementById('user-fullname').textContent =currentUser.username;
            document.getElementById('user-bio').textContent = currentUser.signature || '暂无个人简介';
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

        //加载用户头像
        loadUserAvatar();

        // 头像上传
        document.getElementById('change-avatar-btn').addEventListener('click', function() {
            document.getElementById('avatar-upload').click();
        });

        document.getElementById('avatar-upload').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // 检查文件类型
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
            const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            
            if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
                alert('请上传jpg、png或gif格式的图片！');
                return;
            }
            
            // 检查文件大小（限制2MB）
            if (file.size > 2 * 1024 * 1024) {
                alert('图片大小不能超过2MB！');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                // 先预览新头像
                document.getElementById('user-avatar').src = e.target.result;
                
                // 获取当前用户ID（假设已登录）
                //const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (!currentUser || !currentUser.username) {
                    alert('请先登录！');
                    return;
                }
                
                // 准备表单数据
                const formData = new FormData();
                formData.append('avatar', file);
                formData.append('user_id', currentUser.username);
                
                // 调用后端API更新用户头像
                fetch('http://10.29.172.31:5000/upload_avatar', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // 更新本地存储的头像URL
                        currentUser.avatar = `/get_avatar/${currentUser.username}?t=${new Date().getTime()}`;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        alert('头像更新成功！');
                    } else {
                        alert('头像更新失败: ' + data.message);
                        // 恢复原来的头像
                        document.getElementById('user-avatar').src = currentUser.avatar || 'default-avatar.jpg';
                    }
                })
                .catch(error => {
                    console.error('上传头像出错:', error);
                    alert('上传头像时出错，请重试！');
                    // 恢复原来的头像
                    document.getElementById('user-avatar').src = currentUser.avatar || 'default-avatar.jpg';
                });
            };
            reader.readAsDataURL(file);
        });

        // 评分系统交互
        document.querySelectorAll('.rating-star').forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                
                // 更新星星显示
                document.querySelectorAll('.rating-star').forEach((s, index) => {
                    if (index < value) {
                        s.textContent = '★';
                        s.classList.add('active');
                    } else {
                        s.textContent = '☆';
                        s.classList.remove('active');
                    }
                });
                
                // 更新提示文本
                document.getElementById('rating-text').textContent = `已评分: ${value}星`;
                
                // 这里应该调用后端API提交评分
                // 获取当前景点ID
                const spotId = document.getElementById('spot-modal-title').getAttribute('data-id');
                submitRating(spotId, value);
            });
        });

        // 在initPage函数中添加景区搜索按钮的事件监听
        document.getElementById('search-scenic-btn').addEventListener('click', function() {
            const keyword = document.getElementById('scenic-spot').value.trim();
            if (keyword === '') {
                alert('请输入景区名称');
                return;
            }

            // 使用已有的搜索景点函数
            fetch('http://10.29.172.31:5000/search_spots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: keyword
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    const container = document.getElementById('scenic-results');
                    container.innerHTML = '';
                    
                    if (data.data.length === 0) {
                        container.innerHTML = '<div class="list-group-item">没有找到相关景区</div>';
                        container.style.display = 'block';
                        return;
                    }
                    
                    data.data.forEach(spot => {
                        const item = document.createElement('button');
                        item.type = 'button';
                        item.className = 'list-group-item list-group-item-action';
                        item.innerHTML = `
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5>${spot.name}</h5>
                                    <p class="mb-1">${spot.destination}</p>
                                </div>
                                <div class="text-end">
                                    <span class="badge bg-primary rounded-pill">热度 ${spot.popularity}</span>
                                </div>
                            </div>
                        `;
                        container.appendChild(item);
                        
                        // 添加点击事件
                        item.addEventListener('click', function() {
                            document.getElementById('scenic-spot').value = spot.name;
                            container.style.display = 'none';
                            
                            // 显示路线输入部分
                            document.getElementById('route-inputs').style.display = 'flex';
                            document.getElementById('travel-mode-container').style.display = 'block';
                            document.getElementById('waypoints-container').style.display = 'block'; // 新增
                            document.getElementById('route-submit-btn').style.display = 'block';
                            document.getElementById('scenic-spot').style.display = 'none';
                            document.getElementById('in_spot').style.display = 'none';
                            document.getElementById('search-scenic-btn').style.display = 'none';
                            
                            // 设置起点和终点的占位文本
                            document.getElementById('start-point').placeholder = `在${spot.name}内的起点位置`;
                            document.getElementById('end-point').placeholder = `在${spot.name}内的终点位置`;
                            document.getElementById('waypoint-input').placeholder = `在${spot.name}内的途径点`; // 新增
                            
                            // 可以在这里加载景区地图或设置地图中心点
                            if (map) {
                                // 假设spot对象中有经纬度信息
                                if (spot.longitude && spot.latitude) {
                                    map.setCenter([parseFloat(spot.longitude), parseFloat(spot.latitude)]);
                                    map.setZoom(15);
                                }
                            }
                        });
                    });
                    
                    container.style.display = 'block';
                } else {
                    throw new Error('搜索失败');
                }
            })
            .catch(error => {
                console.error('搜索景区出错:', error);
                const container = document.getElementById('scenic-results');
                container.innerHTML = `
                    <div class="alert alert-danger">
                        搜索失败: ${error.message}
                    </div>
                `;
                container.style.display = 'block';
            });
        });

        // 在initPage函数中添加起点和终点搜索按钮的事件监听
        document.getElementById('search-start-btn').addEventListener('click', function() {
            const keyword = document.getElementById('start-point').value.trim();
            if (keyword === '') {
                alert('请输入起点位置');
                return;
            }
            searchLocation(keyword, 'start-results', 'start-point');
        });

        document.getElementById('search-end-btn').addEventListener('click', function() {
            const keyword = document.getElementById('end-point').value.trim();
            if (keyword === '') {
                alert('请输入终点位置');
                return;
            }
            searchLocation(keyword, 'end-results', 'end-point');
        });

        document.getElementById('add-waypoint-btn').addEventListener('click', function() {
            const keyword = document.getElementById('waypoint-input').value.trim();
            if (keyword === '') {
                alert('请输入途径点位置');
                return;
            }
            
            // 检查是否已达到最大途径点数
            const waypoints = document.querySelectorAll('.waypoint-item');
            if (waypoints.length >= 5) {
                alert('最多只能添加5个途径点');
                return;
            }
            
            searchWaypointLocation(keyword);
        });

        // 动画生成功能
        const animationUploadArea = document.getElementById('animation-upload-area');
        const animationUploadInput = document.getElementById('animation-upload');
        const previewImage = document.getElementById('preview-image');
        const uploadPrompt = document.getElementById('upload-prompt');
        const uploadPreview = document.getElementById('upload-preview');
        const removeImageBtn = document.getElementById('remove-image-btn');
        
        // 点击上传区域触发文件选择
        animationUploadArea.addEventListener('click', function() {
            animationUploadInput.click();
        });
        
        // 拖拽上传功能
        animationUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('border-primary');
        });
        
        animationUploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('border-primary');
        });
        
        animationUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('border-primary');
            
            if (e.dataTransfer.files.length > 0) {
                handleImageUpload(e.dataTransfer.files[0]);
            }
        });
        
        // 文件选择处理
        animationUploadInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleImageUpload(e.target.files[0]);
            }
        });
        
        // 移除图片
        removeImageBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            animationUploadInput.value = '';
            uploadPrompt.style.display = 'block';
            uploadPreview.style.display = 'none';
        });
        
        // 处理图片上传预览
        function handleImageUpload(file) {
            // 检查文件类型
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('请上传JPG或PNG格式的图片');
                return;
            }
            
            // 检查文件大小
            if (file.size > 2 * 1024 * 1024) {
                alert('图片大小不能超过2MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                uploadPrompt.style.display = 'none';
                uploadPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
        
        // 提交动画生成表单
        document.getElementById('animation-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const prompt = document.getElementById('animation-prompt').value.trim();
            if (!prompt) {
                alert('请输入动画描述');
                return;
            }
            
            generateVideo(prompt);
        });
        
        // 导航切换
        document.getElementById('animation-tab').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('home-content').style.display = 'none';
            document.getElementById('diary-content').style.display = 'none';
            document.getElementById('route-content').style.display = 'none';
            document.getElementById('facility-content').style.display = 'none';
            document.getElementById('animation-content').style.display = 'block';
            document.getElementById('food-content').style.display = 'none';
            
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        });

        // 在initPage函数中添加美食推荐导航切换
        document.getElementById('food-tab').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('home-content').style.display = 'none';
            document.getElementById('diary-content').style.display = 'none';
            document.getElementById('route-content').style.display = 'none';
            document.getElementById('facility-content').style.display = 'none';
            document.getElementById('animation-content').style.display = 'none';
            document.getElementById('food-content').style.display = 'block';
            
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // 加载推荐美食
            loadRecommendedFoods();
        });

    }
    
    // 初始化高德地图
    function initMap() {
        map = new AMap.Map('map-container', {
            zoom: 12,
            center: [116.397428, 39.90923] // 默认北京中心点
        });
    }

    function submitRating(spotId, rating) {
        // 获取景点名称（从模态框标题中获取）
        const spotName = document.getElementById('spot-modal-title').textContent;
        
        // 调用后端API提交评分
        fetch('http://10.29.172.31:5000/rate_spot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: spotId,  // 使用景点名称而不是ID
                score: rating    // 使用score而不是rating
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                alert(data.message || '评分提交成功！');
            } else {
                alert('评分提交失败: ' + (data.message || '未知错误'));
            }
        })
        .catch(error => {
            console.error('Error submitting rating:', error);
            alert('评分提交出错，请稍后再试');
        });
    }
    
    function loadRecommendedSpots() {
        // 向后端API获取推荐景点数据
        fetch('http://10.29.172.31:5000/recommend_spots', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const container = document.getElementById('recommended-spots');
                container.innerHTML = '';
                
                data.data.forEach(spot => {
                    const spotElement = document.createElement('div');
                    spotElement.className = 'col-md-6';
                    spotElement.innerHTML = `
                        <div class="card spot-card" data-id="${spot.id}">
                            <img src="${spot.image_path}" class="card-img-top spot-image" alt="${spot.name}">
                            <div class="card-body">
                                <h5 class="card-title">${spot.name}</h5>
                                <div class="rating">${'★'.repeat(Math.floor(spot.score))}${'☆'.repeat(5-Math.floor(spot.score))} ${spot.score}</div>
                                <p class="card-text">${spot.description.substring(0, 50)}...</p>
                            </div>
                        </div>
                    `;
                    container.appendChild(spotElement);
                    
                    // 添加点击事件
                    spotElement.querySelector('.spot-card').addEventListener('click', function() {
                        showSpotDetail(spot);
                    });
                });
            } else {
                console.error('Failed to load recommended spots:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching recommended spots:', error);
            // 如果请求失败，可以显示默认数据或错误提示
        });
    }

    // 显示景点详情
    function showSpotDetail(spot) {
        // console.log(1);
        // 首先发送浏览请求到后端
        fetch('http://10.29.172.31:5000/view_spot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: spot.id,
                username:currentUser.username
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // 如果后端返回更新后的数据，可以在这里处理
                // 例如更新评分或热度显示
                console.log(`景点 ${spot.name} 浏览量已更新`);
            }
        })
        .catch(error => {
            console.error('Error updating spot view count:', error);
        })

        // 填充模态框内容
        document.getElementById('spot-modal-title').textContent = spot.name;
        document.getElementById('spot-modal-title').setAttribute('data-id', spot.id);
        document.getElementById('spot-modal-image').src = spot.image_path;
        document.getElementById('spot-modal-description').textContent = spot.description;
        document.getElementById('spot-modal-address').textContent = spot.destination;
        
        // 设置默认的开放时间和票价（因为接口中没有提供）
        document.getElementById('spot-modal-opening-hours').textContent = '08:30-17:00';
        document.getElementById('spot-modal-ticket').textContent = '票价: 60元';
        
        document.getElementById('spot-modal-rating').innerHTML = 
            `${'★'.repeat(Math.floor(spot.score))}${'☆'.repeat(5-Math.floor(spot.score))} ${spot.score}`;
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('spot-detail-modal'));
        modal.show();
    }

    // 加载用户头像
    function loadUserAvatar() {
        // 获取当前用户（假设已登录）
        //const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.username) {
            console.log('用户未登录，使用默认头像');
            document.getElementById('user-avatar').src = './images/御用头像.jpg';
            return;
        }

        // 添加时间戳参数避免缓存
        const avatarUrl = `http://10.29.172.31:5000/get_avatar/${currentUser.username}?t=${new Date().getTime()}`;
        const avatarElement = document.getElementById('user-avatar');
        
        // 设置加载中的占位图（可选）
        avatarElement.src = 'loading-avatar.gif';
        
        console.log('加载头像URL:', avatarUrl);
        // 获取头像
        fetch(avatarUrl)
            .then(response => {
                if (!response.ok) {
                    // 如果返回404等错误状态
                    return response.json().then(errData => {
                        throw new Error(errData.message || '获取头像失败');
                    });
                }
                return response.blob();
            })
            .then(blob => {
                // 创建对象URL显示图片
                const objectUrl = URL.createObjectURL(blob);
                avatarElement.src = objectUrl;
                
                // 更新本地存储的头像URL（不带时间戳）
                currentUser.avatar = `/get_avatar/${currentUser.username}`;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // 清理之前的对象URL（如果有）
                if (currentUser.avatarObjectUrl) {
                    URL.revokeObjectURL(currentUser.avatarObjectUrl);
                }
                currentUser.avatarObjectUrl = objectUrl;
            })
            .catch(error => {
                console.error('加载头像失败:', error);
                avatarElement.src = './images/御用头像.jpg';
                alert('加载头像失败: ' + error.message);
            });
    }
    
    // 加载热门日记
    function loadPopularDiaries() {
        fetch('http://10.29.172.31:5000/recommend_diaries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(null)  // 根据接口要求发送null
        })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error(`服务器返回错误状态码: ${response.status}`);
            }
        })
        .then(data => {
            if (data.status === 'success') {
                displayRecommendedDiaries(data.diaries);
            } else {
                throw new Error(data.message || '获取推荐日记失败');
            }
        })
        .catch(error => {
            console.error('获取推荐日记错误:', error);
            // 显示空状态或错误提示
            const container = document.getElementById('popular-diaries');
            container.innerHTML = '<div class="alert alert-info">暂时没有推荐日记</div>';
        });
    }

    function displayRecommendedDiaries(diaries) {
        const container = document.getElementById('popular-diaries');
        container.innerHTML = '';
        
        if (!diaries || diaries.length === 0) {
            container.innerHTML = '<div class="alert alert-info">暂时没有推荐日记</div>';
            return;
        }
        
        diaries.forEach(diary => {
            const diaryElement = document.createElement('div');
            diaryElement.className = 'diary-item';
            diaryElement.innerHTML = `
                <h5>${diary.title}</h5>
                <small class="text-muted">
                    作者: ${diary.username} | 
                    景点: ${diary.spot_name} | 
                    热度: ${diary.popularity} | 
                    评分: ${diary.score.toFixed(1)}
                </small>
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
        // 调用后端API获取日记详情（不包含图片）
        fetch('http://10.29.172.31:5000/view_diary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: parseInt(diaryId)
            })
        })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 404) {
                return response.json().then(err => { throw err; });
            } else {
                throw new Error(`服务器返回错误状态码: ${response.status}`);
            }
        })
        .then(data => {
            if (data.status === 'success') {
                const diary = data.data;
                
                // 填充模态框内容
                document.getElementById('diary-modal-title').textContent = diary.title;
                document.getElementById('diary-modal-title').setAttribute('data-id', diary.id);
                document.getElementById('diary-modal-author').textContent = `作者: ${diary.username}`;
                document.getElementById('diary-modal-date').textContent = `日期: ${new Date().toLocaleDateString()}`;
                document.getElementById('diary-modal-content').innerHTML = `<p>${diary.content.replace(/\n/g, '</p><p>')}</p>`;
                
                // 加载媒体文件（通过单独的API调用）
                const imagesContainer = document.getElementById('diary-modal-images');
                imagesContainer.innerHTML = '';
                console.log(diary.has_media);
                if (diary.has_media) {
                    // 假设每个日记最多有2个媒体文件
                    for (let i = 0; i < 2; i++) {
                        const imgElement = document.createElement('img');
                        imgElement.className = 'img-fluid rounded mb-2';
                        imgElement.alt = '日记图片';
                        imgElement.style.maxHeight = '200px';
                        
                        // 设置加载占位图
                        imgElement.src = 'loading.gif';
                        
                        // 通过API获取图片
                        fetch(`http://10.29.172.31:5000/get_image/${diaryId}/${i}`)
                            .then(imgResponse => {
                                if (imgResponse.ok) {
                                    return imgResponse.blob();
                                }
                                throw new Error('图片加载失败');
                            })
                            .then(blob => {
                                const imgUrl = URL.createObjectURL(blob);
                                imgElement.src = imgUrl;
                            })
                            .catch(error => {
                                console.error('加载图片出错:', error);
                                // 如果图片加载失败，显示占位图
                                imgElement.src = 'placeholder.jpg';
                            });
                        
                        imagesContainer.appendChild(imgElement);
                    }
                }
                
                // 初始化评分星星
                document.querySelectorAll('#diary-detail-modal .rating-stars').forEach(star => {
                    star.textContent = '☆';
                    star.classList.remove('active');
                });
                document.getElementById('diary-rating-text').textContent = '请评分';
                
                // 显示模态框
                const modal = new bootstrap.Modal(document.getElementById('diary-detail-modal'));
                modal.show();
            } else {
                throw new Error(data.message || '获取日记详情失败');
            }
        })
        .catch(error => {
            console.error('获取日记详情出错:', error);
            showToast(`获取日记失败: ${error.message}`, 'danger');
        });
    }

    // 高亮显示搜索结果
    function highlightSearchResults(searchText, positions) {
        const contentElement = document.getElementById('diary-modal-content');
        const content = contentElement.textContent;
        
        // 清除之前的高亮
        contentElement.innerHTML = content;
        
        if (!positions || positions.length === 0) return;
        
        // 根据位置信息高亮文本
        let highlightedContent = '';
        let lastPos = 0;
        
        positions.sort((a, b) => a - b).forEach(pos => {
            const start = pos;
            const end = pos + searchText.length;
            
            // 添加未匹配部分
            highlightedContent += content.substring(lastPos, start);
            
            // 添加高亮匹配部分
            highlightedContent += `<span class="highlight">${content.substring(start, end)}</span>`;
            
            lastPos = end;
        });
        
        // 添加剩余部分
        highlightedContent += content.substring(lastPos);
        
        contentElement.innerHTML = highlightedContent;
        
        // 滚动到第一个匹配项
        const firstHighlight = document.querySelector('.highlight');
        if (firstHighlight) {
            firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // 显示通知消息
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast show align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        const toastContainer = document.getElementById('toast-container') || document.body;
        toastContainer.appendChild(toast);
        
        // 自动消失
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 添加日记内容搜索功能
    document.getElementById('diary-search-btn-1').addEventListener('click', function() {
        const searchText = document.getElementById('diary-search-input-1').value.trim();
        
        // 验证搜索内容
        if (!searchText) {
            showToast('请输入搜索内容', 'warning');
            return;
        }
        
        // 获取当前日记ID
        const diaryId = document.getElementById('diary-modal-title').getAttribute('data-id');
        if (!diaryId || isNaN(diaryId)) {
            showToast('无效的日记ID', 'danger');
            return;
        }
        
        // 显示加载状态
        const searchBtn = this;
        const originalText = searchBtn.innerHTML;
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 搜索中...';
        
        // 准备请求数据
        const requestData = {
            diary_id: parseInt(diaryId),
            search_text: searchText
        };
        
        // 调用后端API进行搜索
        fetch('http://10.29.172.31:5000/search_in_diary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 404) {
                return response.json().then(err => { 
                    throw new Error(err.message || '未找到匹配内容'); 
                });
            } else {
                throw new Error(`服务器返回错误状态码: ${response.status}`);
            }
        })
        .then(data => {
            if (data.status === 'success') {
                // 高亮显示匹配的文本
                highlightSearchResults(searchText, data.positions);
                
                // 显示匹配数量
                const count = data.positions.length;
                if (count > 0) {
                    showToast(`找到 ${count} 处匹配`, 'success');
                } else {
                    showToast('没有找到匹配内容', 'info');
                }
            } else {
                throw new Error(data.message || '搜索失败');
            }
        })
        .catch(error => {
            console.error('搜索日记内容出错:', error);
            showToast(`搜索失败: ${error.message}`, 'danger');
        })
        .finally(() => {
            // 恢复按钮状态
            searchBtn.disabled = false;
            searchBtn.innerHTML = originalText;
        });
    });
    // 添加评分事件监听
    document.querySelectorAll('#diary-detail-modal .rating-stars').forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            const diaryId = document.getElementById('diary-modal-title').getAttribute('data-id');
            
            if (!diaryId) {
                showToast('无法获取日记ID', 'danger');
                return;
            }
            
            // 更新星星显示
            document.querySelectorAll('#diary-detail-modal .rating-stars').forEach((s, index) => {
                if (index < value) {
                    s.textContent = '★';
                    s.classList.add('active');
                } else {
                    s.textContent = '☆';
                    s.classList.remove('active');
                }
            });
            
            // 更新提示文本
            document.getElementById('diary-rating-text').textContent = `已评分: ${value}星`;
            
            // 调用后端API提交评分
            submitDiaryRating(diaryId, value);
        });
    });
    
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
            { id: 2, username: 'travel_lover', name: '李四', avatar: './images/御用头像.jpg' },
            { id: 3, username: 'photo_master', name: '王五', avatar: './images/御用头像.jpg' },
            { id: 4, username: 'food_explorer', name: '赵六', avatar: './images/御用头像.jpg' }
        ];
        
        const container = document.getElementById('recommended-users');
        container.innerHTML = '';
        
        users.forEach(user => {
            const userElement = document.createElement('a');
            userElement.href = `user.html?id=${user.id}`;
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
        
    // 搜索日记关联景点
    document.getElementById('search-diary-spot-btn').addEventListener('click', function() {
        const keyword = document.getElementById('diary-spot-input').value.trim();
        if (keyword === '') {
            alert('请输入景点名称');
            return;
        }

        fetch('http://10.29.172.31:5000/search_spots', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: keyword
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                const container = document.getElementById('diary-spot-results');
                container.innerHTML = '';
                
                if (data.data.length === 0) {
                    container.innerHTML = '<div class="list-group-item">没有找到相关景点</div>';
                    container.style.display = 'block';
                    return;
                }
                
                data.data.forEach(spot => {
                    const item = document.createElement('button');
                    item.type = 'button';
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>${spot.name}</h5>
                                <p class="mb-1">${spot.destination}</p>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-primary rounded-pill">热度 ${spot.popularity}</span>
                            </div>
                        </div>
                    `;
                    container.appendChild(item);
                    
                    // 添加点击事件
                    item.addEventListener('click', function() {
                        document.getElementById('diary-spot-input').value = spot.name;
                        document.getElementById('diary-spot-id').value = spot.id;
                        container.style.display = 'none';
                    });
                });
                
                container.style.display = 'block';
            } else {
                throw new Error('搜索失败');
            }
        })
        .catch(error => {
            console.error('搜索景点出错:', error);
            const container = document.getElementById('diary-spot-results');
            container.innerHTML = `
                <div class="alert alert-danger">
                    搜索失败: ${error.message}
                </div>
            `;
            container.style.display = 'block';
        });
    });
    
    // 规划路线
    function planRoute(start, end, mode) {
        // 获取所有途径点
        const waypoints = Array.from(document.querySelectorAll('.waypoint-item')).map(item => {
            return item.querySelector('span').textContent;
        });
        
        // 清除现有路线
        if (currentRoute) {
            map.remove(currentRoute);
        }
        
        // 根据是否有途径点选择不同的API和请求数据
        const apiEndpoint = waypoints.length > 0 
            ? 'http://10.29.172.31:5000/multi_point_path_planning' 
            : 'http://10.29.172.31:5000/path_planning';
        
        // 准备请求数据
        const requestData = waypoints.length > 0
            ? {
                start_point: start,
                waypoints: waypoints,
                can_bike: mode === '1'
            }
            : {
                start_point: start,
                end_point: end,
                can_bike: mode === '1'
            };
        
        // 调用后端API计算路径
        fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || '路径规划失败');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                // 绘制路线
                currentRoute = new AMap.Polyline({
                    path: data.coordinates,
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
                const hours = Math.floor(data.total_cost / 3600);
                const minutes = Math.round((data.total_cost-hours*3600) / 60);
                let timeText = '';
                if (hours > 0) {
                    timeText += `${hours}小时`;
                }
                if (minutes > 0) {
                    timeText += `${minutes}分钟`;
                }
                
                document.getElementById('route-info').innerHTML = `
                    <div class="alert alert-info">
                        <strong>路线规划成功！</strong> 预计耗时 ${timeText}
                    </div>
                `;
            } else {
                throw new Error(data.message || '路径规划失败');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('route-info').innerHTML = `
                <div class="alert alert-danger">
                    <strong>路线规划失败:</strong> ${error.message}
                </div>
            `;
        });
    }

    // 添加搜索位置函数
    function searchLocation(keyword, resultsContainerId, inputFieldId) {
        // 调用新的位置搜索API
        fetch('http://10.29.172.31:5000/api/search_location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: keyword
            })
        })
        .then(response => {
            if (!response.ok) {
                // 根据API规范，错误状态码为404
                if (response.status === 404) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || '未找到相关位置');
                    });
                }
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                const container = document.getElementById(resultsContainerId);
                container.innerHTML = '';
                
                if (!data.locations || data.locations.length === 0) {
                    container.innerHTML = '<div class="list-group-item">没有找到相关位置</div>';
                    container.style.display = 'block';
                    return;
                }
                
                // 根据API响应格式，locations是一个字符串数组
                data.locations.forEach(location => {
                    const item = document.createElement('button');
                    item.type = 'button';
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>${location}</h5>
                            </div>
                        </div>
                    `;
                    container.appendChild(item);
                    
                    // 添加点击事件
                    item.addEventListener('click', function() {
                        document.getElementById(inputFieldId).value = location;
                        container.style.display = 'none';
                        
                        // 如果两个位置都已选择，显示提交按钮
                        if (document.getElementById('start-point').value && document.getElementById('end-point').value) {
                            document.getElementById('route-submit-btn').style.display = 'block';
                        }
                    });
                });
                
                container.style.display = 'block';
            } else {
                throw new Error(data.message || '搜索失败');
            }
        })
        .catch(error => {
            console.error('搜索位置出错:', error);
            const container = document.getElementById(resultsContainerId);
            container.innerHTML = `
                <div class="alert alert-danger">
                    搜索失败: ${error.message}
                </div>
            `;
            container.style.display = 'block';
        });
    }
    
    // 事件监听
    
    // 导航栏切换
    document.getElementById('home-tab').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('home-content').style.display = 'block';
        document.getElementById('diary-content').style.display = 'none';
        document.getElementById('route-content').style.display = 'none';
        document.getElementById('facility-content').style.display = 'none';
        document.getElementById('animation-content').style.display = 'none';
        document.getElementById('food-content').style.display = 'none';
        
        // 更新active状态
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    });
    
    document.getElementById('diary-tab').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('home-content').style.display = 'none';
        document.getElementById('diary-content').style.display = 'block';
        document.getElementById('route-content').style.display = 'none';
        document.getElementById('facility-content').style.display = 'none';
        document.getElementById('animation-content').style.display = 'none';
        document.getElementById('food-content').style.display = 'none';
        
        // 更新active状态
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    });
    
    document.getElementById('route-tab').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('home-content').style.display = 'none';
        document.getElementById('diary-content').style.display = 'none';
        document.getElementById('route-content').style.display = 'block';
        document.getElementById('facility-content').style.display = 'none';
        document.getElementById('animation-content').style.display = 'none';
        document.getElementById('food-content').style.display = 'none';
        
        // 更新active状态
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    });

    // 在事件监听部分添加导航栏切换
    document.getElementById('facility-tab').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('home-content').style.display = 'none';
        document.getElementById('diary-content').style.display = 'none';
        document.getElementById('route-content').style.display = 'none';
        document.getElementById('facility-content').style.display = 'block';
        document.getElementById('animation-content').style.display = 'none';
        document.getElementById('food-content').style.display = 'none';
        
        // 更新active状态
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
        
        // 初始化设施查询地图
        if (!window.facilityMap) {
            window.facilityMap = new AMap.Map('facility-map-container', {
                zoom: 15,
                center: [116.397428, 39.90923] // 默认北京中心点
            });
        }
    });

    // 添加设施查询功能
    document.getElementById('search-facility-btn').addEventListener('click', function() {
        const type = document.getElementById('facility-type').value;
        const building = document.getElementById('facility-location').value.trim();
        
        if (!building) {
            alert('请输入建筑名称');
            return;
        }
        
        // 显示加载状态
        const resultsContainer = document.getElementById('facility-results');
        resultsContainer.innerHTML = '<div class="list-group-item">正在查询中...</div>';
        resultsContainer.style.display = 'block';
        console.log(type);
        // 调用后端API查询设施
        fetch('http://10.29.172.31:5000/query_facilities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                building: building,
                type: type === 'all' ? 'all' : type
            })
        })
        .then(response => {
            if (response.status === 404) {
                return response.json().then(errData => {
                    throw new Error(errData.message || '未找到相关设施');
                });
            }
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                resultsContainer.innerHTML = '';
                
                if (data.locations.length === 0) {
                    resultsContainer.innerHTML = '<div class="list-group-item">没有找到相关设施</div>';
                    return;
                }
                
                // 清除地图上的标记
                if (window.facilityMarkers) {
                    window.facilityMarkers.forEach(marker => marker.setMap(null));
                }
                window.facilityMarkers = [];
                
                // 显示设施列表
                data.locations.forEach(location => {
                    const item = document.createElement('div');
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>${location.name}</h5>
                                <p class="mb-1">${location.primary_type}${location.secondary_type ? ' - ' + location.secondary_type : ''}</p>
                                <p class="mb-1">距离: ${location.distance.toFixed(1)}米</p>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-primary rounded-pill">${typeMap[location.primary_type] || location.primary_type}</span>
                            </div>
                        </div>
                    `;
                    resultsContainer.appendChild(item);
                    
                    // 这里需要根据实际情况获取经纬度信息
                    // 由于后端返回的数据中没有经纬度，我们暂时无法在地图上标记
                    // 可以添加一个获取位置的函数，或者修改后端接口返回经纬度
                });
                
                // 隐藏地图容器，因为当前接口不返回经纬度信息
                document.getElementById('facility-map-container').style.display = 'none';
                
            } else {
                throw new Error(data.message || '查询失败');
            }
        })
        .catch(error => {
            console.error('设施查询出错:', error);
            resultsContainer.innerHTML = `
                <div class="alert alert-danger">
                    查询失败: ${error.message}
                </div>
            `;
            document.getElementById('facility-map-container').style.display = 'none';
        });
    });

    // 设施类型映射
    const typeMap = {
        'all': '全部',
        '餐厅': '餐厅',
        '卫生间': '卫生间',
        '停车场': '停车场',
        '超市': '超市',
        '急救站': '急救站'
    };
    
    // 景点搜索
    document.getElementById('spot-search-btn').addEventListener('click', function() {
        const keyword = document.getElementById('spot-search-input').value.trim();
        if (keyword === '') {
            alert('请输入搜索关键词');
            return;
        }
        
        // 向后端API发送搜索请求
        fetch('http://10.29.172.31:5000/search_spots', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: keyword
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                const container = document.getElementById('search-results');
                container.innerHTML = '';
                
                if (data.data.length === 0) {
                    container.innerHTML = '<div class="list-group-item">没有找到相关景点</div>';
                    return;
                }
                
                data.data.forEach(spot => {
                    const item = document.createElement('a');
                    item.href = '#';
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>${spot.name}</h5>
                                <p class="mb-1">${spot.destination}</p>
                                <p class="mb-0 text-muted">${spot.description.substring(0, 50)}...</p>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-primary rounded-pill">热度 ${spot.popularity}</span>
                                <div class="rating text-warning">
                                    ${'★'.repeat(Math.floor(spot.score))}${'☆'.repeat(5-Math.floor(spot.score))}
                                </div>
                            </div>
                        </div>
                    `;
                    container.appendChild(item);
                    
                    // 添加点击事件
                    item.addEventListener('click', function(e) {
                        e.preventDefault();
                        showSpotDetail(spot);
                    });
                });
            } else {
                throw new Error('搜索失败');
            }
        })
        .catch(error => {
            console.error('搜索景点出错:', error);
            const container = document.getElementById('search-results');
            container.innerHTML = `
                <div class="alert alert-danger">
                    搜索失败: ${error.message}
                </div>
            `;
        });
    });
    
    // 日记搜索
    document.getElementById('diary-search-btn').addEventListener('click', function() {
        const diaryId = document.getElementById('diary-search-input').value.trim();
        
        // 验证输入是否为有效数字（因为后端要求diary_id是int）
        if (diaryId === '' || isNaN(diaryId)) {
            alert('请输入有效的日记ID');
            return;
        }
        
        // 调用后端API获取日记详情
        fetch('http://10.29.172.31:5000/get_diary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                diary_id: parseInt(diaryId)  // 确保转换为整数
            })
        })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 404) {
                return response.json().then(err => { throw err; });
            } else {
                throw new Error(`服务器返回错误状态码: ${response.status}`);
            }
        })
        .then(data => {
            if (data.status === 'success') {
                // 显示日记详情
                displayDiaryDetail(data.diary);
            } else {
                throw new Error(data.message || '获取日记失败');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || '查询日记时出错');
            
            // 清空搜索结果
            const container = document.getElementById('diary-search-results');
            container.innerHTML = '<div class="list-group-item">没有找到相关日记</div>';
        });
    });

    function displayDiaryDetail(diary) {
        const container = document.getElementById('diary-search-results');
        container.innerHTML = '';
        
        const item = document.createElement('div');
        item.className = 'list-group-item diary-item'; // 添加 diary-item 类
        item.innerHTML = `
            <h3>${diary.title}</h3>
            <div class="text-muted mb-3">
                <span>作者: ${diary.username}</span> | 
                <span>景点: ${diary.spot_name}</span> | 
                <span>日期: ${new Date(diary.created_at).toLocaleDateString()}</span>
            </div>
            <div class="mb-3">
                ${diary.media && diary.media.map(media => `
                    ${media.type === 'image' ? 
                        `` : 
                        `<video controls class="img-thumbnail m-1" style="max-height: 150px;">
                            <source src="${media.url}" type="video/mp4">
                        </video>`
                    }
                `).join('')}
            </div>
            <div class="mb-3">${diary.content.substring(0, 100)}...</div>
            <div class="text-muted">
                <span>评分: ${diary.score.toFixed(1)}</span> | 
                <span>热度: ${diary.popularity}</span> | 
                <span>评论数: ${diary.rating_count}</span>
            </div>
        `;
        
        // 添加点击事件
        item.addEventListener('click', function() {
            showDiaryDetail(diary.id);
        });
        
        container.appendChild(item);
    }
    
    // 提交日记表单
    document.getElementById('diary-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('diary-title').value.trim();
        const content = document.getElementById('diary-content-input').value.trim();
        const spotName = document.getElementById('diary-spot-input').value.trim();
        const spotId = document.getElementById('diary-spot-id').value.trim();
        const username = currentUser.username;
        const mediaFiles = document.getElementById('diary-attachments').files;
        
        // 验证必填字段
        if (title === '' || content === '' || username === '' || spotName === '') {
            alert('请填写所有必填字段（标题、内容、用户名和景点名）');
            return;
        }
        
        // 准备表单数据（使用FormData而不是JSON）
        const formData = new FormData();
        formData.append('title', title);
        formData.append('username', username);
        formData.append('spot_name', spotName);
        formData.append('spot_id', spotId);
        formData.append('content', content);
        
        // 添加多个媒体文件
        for (let i = 0; i < mediaFiles.length; i++) {
            formData.append('media', mediaFiles[i]);
        }
        
        console.dir(formData);
        // 调用后端API
        fetch('http://10.29.172.31:5000/create_diary', {
            method: 'POST',
            body: formData,  // 直接发送FormData对象
            // 注意：不要设置Content-Type头部，浏览器会自动设置multipart/form-data
        })
        .then(response => {
            if (response.status === 201) {
                return response.json();
            } else if (response.status === 400) {
                return response.json().then(err => { throw err; });
            } else {
                throw new Error(`服务器返回错误状态码: ${response.status}`);
            }
        })
        .then(data => {
            if (data.status === 'success') {
                alert(data.message || '日记创建成功！');
                console.log('创建的日记ID:', data.diary_id);
                console.log('媒体文件URL:', data.media_urls);
                
                // 清空表单
                this.reset();
                document.getElementById('attachments-preview').innerHTML = '';
                
                // 刷新我的日记列表
                loadMyDiaries();
            } else {
                throw new Error(data.message || '日记创建失败');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || '提交日记时出错');
        });
    });

    // 附件预览
    document.getElementById('diary-attachments').addEventListener('change', function(e) {
        const files = e.target.files;
        const previewContainer = document.getElementById('attachments-preview');
        previewContainer.innerHTML = '';
        
        if (files.length > 2) {
            alert('最多只能上传2个附件');
            this.value = '';
            return;
        }
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewElement = document.createElement('div');
                previewElement.className = 'mb-2';
                
                if (file.type.startsWith('image/')) {
                    previewElement.innerHTML = `
                        <img src="${e.target.result}" class="img-thumbnail" style="max-height: 100px;" alt="预览">
                        <small>${file.name}</small>
                    `;
                } else if (file.type.startsWith('video/')) {
                    previewElement.innerHTML = `
                        <video controls class="img-thumbnail" style="max-height: 100px;">
                            <source src="${e.target.result}" type="${file.type}">
                        </video>
                        <small>${file.name}</small>
                    `;
                }
                
                previewContainer.appendChild(previewElement);
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // 提交路线规划表单
    document.getElementById('route-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const scenicSpot = document.getElementById('scenic-spot').value.trim();
        const start = document.getElementById('start-point').value.trim();
        const end = document.getElementById('end-point').value.trim();
        const mode = document.getElementById('travel-mode').value;
        
        if (scenicSpot === '') {
            alert('请先选择景区');
            return;
        }
        
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

    // 添加搜索途径点位置的函数
    function searchWaypointLocation(keyword) {
        fetch('http://10.29.172.31:5000/api/search_location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: keyword
            })
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || '未找到相关位置');
                    });
                }
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                const container = document.getElementById('waypoint-results');
                container.innerHTML = '';
                
                if (!data.locations || data.locations.length === 0) {
                    container.innerHTML = '<div class="list-group-item">没有找到相关位置</div>';
                    container.style.display = 'block';
                    return;
                }
                
                data.locations.forEach(location => {
                    const item = document.createElement('button');
                    item.type = 'button';
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>${location}</h5>
                            </div>
                        </div>
                    `;
                    container.appendChild(item);
                    
                    // 添加点击事件
                    item.addEventListener('click', function() {
                        addWaypoint(location);
                        document.getElementById('waypoint-input').value = '';
                        container.style.display = 'none';
                    });
                });
                
                container.style.display = 'block';
            } else {
                throw new Error(data.message || '搜索失败');
            }
        })
        .catch(error => {
            console.error('搜索途径点位置出错:', error);
            const container = document.getElementById('waypoint-results');
            container.innerHTML = `
                <div class="alert alert-danger">
                    搜索失败: ${error.message}
                </div>
            `;
            container.style.display = 'block';
        });
    }

    // 添加途径点到列表
    function addWaypoint(location) {
        const waypointsList = document.getElementById('waypoints-list');
        const waypointId = `waypoint-${Date.now()}`;
        
        const waypointItem = document.createElement('div');
        waypointItem.className = 'waypoint-item mb-2 p-2 border rounded';
        waypointItem.id = waypointId;
        waypointItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${location}</span>
                <button class="btn btn-sm btn-outline-danger remove-waypoint" data-id="${waypointId}">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
        waypointsList.appendChild(waypointItem);
        
        // 添加删除按钮事件
        waypointItem.querySelector('.remove-waypoint').addEventListener('click', function() {
            document.getElementById(waypointId).remove();
        });
        
        // 显示提交按钮
        document.getElementById('route-submit-btn').style.display = 'block';
    }

    function submitDiaryRating(diaryId, rating) {
        // 验证评分是否在1-5范围内
        if (rating < 1 || rating > 5) {
            alert('请给出1-5分的有效评分');
            return;
        }

        fetch('http://10.29.172.31:5000/rate_diary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                diary_id: parseInt(diaryId),  // 确保转换为整数
                score: parseInt(rating)      // 确保转换为整数
            })
        })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 400) {
                return response.json().then(err => { throw err; });
            } else {
                throw new Error(`服务器返回错误状态码: ${response.status}`);
            }
        })
        .then(data => {
            if (data.status === 'success') {
                alert(data.message || '评分成功！');
                
                // 可选：刷新日记详情显示新评分
                if (typeof refreshDiaryDetails === 'function') {
                    refreshDiaryDetails(diaryId);
                }
            } else {
                throw new Error(data.message || '评分提交失败');
            }
        })
        .catch(error => {
            console.error('评分提交错误:', error);
            alert(error.message || '评分提交出错，请稍后再试');
        });
    }

    // 生成视频函数
    function generateVideo(prompt) {
        const generateBtn = document.getElementById('generate-btn');
        const originalBtnText = generateBtn.innerHTML;
        
        // 显示加载状态
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 生成中...';
        
        // 准备请求数据
        const requestData = {
            prompt: prompt
        };
        
        // 调用后端API生成视频
        fetch('http://127.0.0.1:5000/generate_video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data.video_url) {
                // 显示生成的视频
                const videoElement = document.getElementById('generated-video');
                const downloadBtn = document.getElementById('download-btn');
                
                videoElement.href = data.video_url;
                downloadBtn.href = data.video_url;
                
                document.getElementById('video-result').style.display = 'block';
                showToast('视频生成成功！', 'success');
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                throw new Error('视频生成失败');
            }
        })
        .catch(error => {
            console.error('生成视频出错:', error);
            showToast(`生成视频失败: ${error.message}`, 'danger');
        })
        .finally(() => {
            // 恢复按钮状态
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalBtnText;
        });
    }

    // 模拟美食数据
    const mockFoods = [
        {
            id: 1,
            name: "北京烤鸭",
            cuisine: "京菜",
            restaurant: "全聚德",
            price: "198元/只",
            description: "北京烤鸭是北京名食，它以色泽红艳，肉质细嫩，味道醇厚，肥而不腻的特色，被誉为'天下美味'而驰名中外。",
            popularity: 95,
            score: 4.8,
            image_path: "./images/北京烤鸭.jpg"
        },
        {
            id: 2,
            name: "四川火锅",
            cuisine: "川菜",
            restaurant: "海底捞",
            price: "人均120元",
            description: "四川火锅以麻、辣、鲜、香著称，汤底浓郁，食材丰富，是冬季最受欢迎的美食之一。",
            popularity: 92,
            score: 4.7,
            image_path: "./images/四川火锅.jpg"
        },
        {
            id: 3,
            name: "广东早茶",
            cuisine: "粤菜",
            restaurant: "广州酒家",
            price: "人均80元",
            description: "广东早茶是广东地区的传统饮食文化，包括虾饺、烧卖、叉烧包等多种精致点心。",
            popularity: 88,
            score: 4.6,
            image_path: "./images/广东早茶.jpg"
        },
        {
            id: 4,
            name: "上海小笼包",
            cuisine: "沪菜",
            restaurant: "南翔馒头店",
            price: "38元/笼",
            description: "上海小笼包皮薄馅多，汤汁鲜美，是上海最具代表性的小吃之一。",
            popularity: 90,
            score: 4.5,
            image_path: "./images/上海小笼包.jpg"
        },
        {
            id: 5,
            name: "湖南剁椒鱼头",
            cuisine: "湘菜",
            restaurant: "湘鄂情",
            price: "98元/份",
            description: "湖南剁椒鱼头以鲜辣著称，鱼肉鲜嫩，剁椒香辣，是湖南特色名菜。",
            popularity: 85,
            score: 4.4,
            image_path: "./images/湖南剁椒鱼头.jpg"
        },
        {
            id: 6,
            name: "西安肉夹馍",
            cuisine: "陕菜",
            restaurant: "老孙家",
            price: "15元/个",
            description: "西安肉夹馍是陕西著名小吃，馍香肉酥，肥而不腻，回味无穷。",
            popularity: 87,
            score: 4.3,
            image_path: "./images/西安肉夹馍.jpg"
        },
        {
            id: 7,
            name: "云南过桥米线",
            cuisine: "滇菜",
            restaurant: "桥香园",
            price: "35元/份",
            description: "云南过桥米线汤鲜味美，配料丰富，是云南最具代表性的美食之一。",
            popularity: 84,
            score: 4.2,
            image_path: "./images/云南过桥米线.jpg"
        },
        {
            id: 8,
            name: "杭州西湖醋鱼",
            cuisine: "浙菜",
            restaurant: "楼外楼",
            price: "128元/份",
            description: "杭州西湖醋鱼选用西湖草鱼，鱼肉鲜嫩，酸甜适口，是杭州传统名菜。",
            popularity: 83,
            score: 4.1,
            image_path: "./images/杭州西湖醋鱼.jpg"
        },
        {
            id: 9,
            name: "重庆小面",
            cuisine: "渝菜",
            restaurant: "秦云老太婆摊摊面",
            price: "12元/碗",
            description: "重庆小面麻辣鲜香，面条劲道，是重庆人最爱的早餐之一。",
            popularity: 86,
            score: 4.4,
            image_path: "./images/重庆小面.jpg"
        },
        {
            id: 10,
            name: "兰州牛肉面",
            cuisine: "陇菜",
            restaurant: "马子禄",
            price: "18元/碗",
            description: "兰州牛肉面汤清味美，面条筋道，牛肉鲜嫩，是兰州最具代表性的美食。",
            popularity: 89,
            score: 4.5,
            image_path: "./images/兰州牛肉面.jpg"
        }
    ];

    // 加载推荐美食
    function loadRecommendedFoods() {
        const container = document.getElementById('recommended-foods');
        container.innerHTML = '';
        
        mockFoods.forEach(food => {
            const foodElement = document.createElement('div');
            foodElement.className = 'col-md-6 mb-4';
            foodElement.innerHTML = `
                <div class="card food-card" data-id="${food.id}">
                    
                    <div class="card-body">
                        <h5 class="card-title">${food.name}</h5>
                        <div class="d-flex justify-content-between">
                            <span class="text-muted">${food.cuisine}</span>
                            <div class="rating">${'★'.repeat(Math.floor(food.score))}${'☆'.repeat(5-Math.floor(food.score))} ${food.score}</div>
                        </div>
                        <p class="card-text mt-2"><small>${food.restaurant}</small></p>
                    </div>
                </div>
            `;
            container.appendChild(foodElement);
            
            // 添加点击事件
            foodElement.querySelector('.food-card').addEventListener('click', function() {
                showFoodDetail(food);
            });
        });
    }

    // 显示美食详情
    function showFoodDetail(food) {
        // 填充模态框内容
        document.getElementById('food-modal-title').textContent = food.name;
        document.getElementById('food-modal-title').setAttribute('data-id', food.id);
        document.getElementById('food-modal-image').src = food.image_path;
        document.getElementById('food-modal-cuisine').textContent = food.cuisine;
        document.getElementById('food-modal-restaurant').textContent = food.restaurant;
        document.getElementById('food-modal-price').textContent = food.price;
        document.getElementById('food-modal-description').textContent = food.description;
        document.getElementById('food-modal-popularity').textContent = food.popularity;
        document.getElementById('food-modal-rating').innerHTML = 
            `${'★'.repeat(Math.floor(food.score))}${'☆'.repeat(5-Math.floor(food.score))} ${food.score}`;
        
        // 重置评分星星
        document.querySelectorAll('.food-rating-star').forEach(star => {
            star.textContent = '☆';
            star.classList.remove('active');
        });
        document.getElementById('food-rating-text').textContent = '请评分';
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('food-detail-modal'));
        modal.show();
    }

    // 美食搜索功能
    document.getElementById('food-search-btn').addEventListener('click', function() {
        const keyword = document.getElementById('food-search-input').value.trim().toLowerCase();
        if (keyword === '') {
            alert('请输入搜索关键词');
            return;
        }
        
        const results = mockFoods.filter(food => 
            food.name.toLowerCase().includes(keyword) || 
            food.cuisine.toLowerCase().includes(keyword) ||
            food.restaurant.toLowerCase().includes(keyword)
        );
        
        const container = document.getElementById('food-search-results');
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<div class="list-group-item">没有找到相关美食</div>';
            return;
        }
        
        results.forEach(food => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5>${food.name}</h5>
                        <p class="mb-1">${food.cuisine} · ${food.restaurant}</p>
                        <p class="mb-0 text-muted">${food.description.substring(0, 50)}...</p>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-primary rounded-pill">热度 ${food.popularity}</span>
                        <div class="rating text-warning">
                            ${'★'.repeat(Math.floor(food.score))}${'☆'.repeat(5-Math.floor(food.score))}
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(item);
            
            // 添加点击事件
            item.addEventListener('click', function(e) {
                e.preventDefault();
                showFoodDetail(food);
            });
        });
    });

    // 美食评分功能
    document.querySelectorAll('.food-rating-star').forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            
            // 更新星星显示
            document.querySelectorAll('.food-rating-star').forEach((s, index) => {
                if (index < value) {
                    s.textContent = '★';
                    s.classList.add('active');
                } else {
                    s.textContent = '☆';
                    s.classList.remove('active');
                }
            });
            
            // 更新提示文本
            document.getElementById('food-rating-text').textContent = `已评分: ${value}星`;
            
            // 这里可以添加提交评分的逻辑
            const foodId = document.getElementById('food-modal-title').getAttribute('data-id');
            alert(`已为美食ID ${foodId} 评分 ${value} 星`);
        });
    });

})