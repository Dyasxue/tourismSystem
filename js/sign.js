        // 获取按钮和模态框
        const loginRegisterBtn = document.getElementById('loginRegisterBtn');
        const signmodal = document.getElementById('loginRegisterModal');
        const closeBtn = document.querySelector('.close');

        // 获取界面元素
        const loginPage = document.getElementById('loginPage');
        const registerPage = document.getElementById('registerPage');
        const forgotPasswordPage = document.getElementById('forgotPasswordPage');

        // 获取切换按钮
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToForgotPassword = document.getElementById('switchToForgotPassword');
        const switchToLoginFromRegister = document.getElementById('switchToLoginFromRegister');
        const switchToLoginFromForgotPassword = document.getElementById('switchToLoginFromForgotPassword');

        // 获取协议详情页面元素
        const agreementModal = document.getElementById('agreementModal');
        const userAgreementLink = document.getElementById('userAgreementLink');

        // 点击按钮时显示模态框
        loginRegisterBtn.addEventListener('click', () => {
            signmodal.style.display = 'block';
            showLoginPage(); // 默认显示登录界面
        });

        // 点击关闭按钮时隐藏模态框
        closeBtn.addEventListener('click', () => {
            signmodal.style.display = 'none';
        });

        // 清空表单内容
        function clearForm(formId) {
            const form = document.getElementById(formId);
            if (form) {
                form.reset();
            }
        }

        // 显示登录界面
        function showLoginPage() {
            loginPage.classList.remove('hidden');
            registerPage.classList.add('hidden');
            forgotPasswordPage.classList.add('hidden');
            clearForm('loginForm'); // 清空登录表单
        }

        // 显示注册界面
        switchToRegister.addEventListener('click', () => {
            loginPage.classList.add('hidden');
            registerPage.classList.remove('hidden');
            forgotPasswordPage.classList.add('hidden');
            clearForm('registerForm'); // 清空注册表单
        });

        // 显示忘记密码界面
        switchToForgotPassword.addEventListener('click', () => {
            loginPage.classList.add('hidden');
            registerPage.classList.add('hidden');
            forgotPasswordPage.classList.remove('hidden');
            clearForm('forgotPasswordForm'); // 清空忘记密码表单
        });

        // 从注册界面返回登录界面
        switchToLoginFromRegister.addEventListener('click', showLoginPage);

        // 从忘记密码界面返回登录界面
        switchToLoginFromForgotPassword.addEventListener('click', showLoginPage);

        // 处理登录表单提交
        document.getElementById('loginForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!document.getElementById('agreeCheckbox').checked) {
                alert("请先同意用户协议！");
                return;
            }

            // 构造请求数据
            const loginData = {
                username: username,
                password: password
            };

            // 发送登录请求
            fetch('http://10.29.172.31:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('登录失败');
                }
            })
            .then(data => {
                console.log(data);
                // 登录成功处理
                const mockUser = {
                    username: data.username || "街口施法老太",
                    signature: data.signature || "为有牺牲多壮志，敢叫日月换新天",
                    avatar: "./images/御用头像.jpg"
                };
                localStorage.setItem('currentUser', JSON.stringify(mockUser));
                signmodal.style.display = 'none';
                window.location.href = 'main.html';
            })
            .catch(error => {
                alert(error.message);
            });
        });

        // 处理注册表单提交
        document.getElementById('registerForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const newUsername = document.getElementById('newUsername').value;
            const newPassword = document.getElementById('newPassword').value;

            // 构造请求数据
            const registerData = {
                username: newUsername,
                password: newPassword,
            };

            // 发送注册请求
            fetch('http://10.29.172.31:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData)
            })
            .then(response => {
                if (response.status === 201) {
                    return response.json();
                } else {
                    return response.json().then(err => {
                        throw new Error(err.error || '注册失败');
                    });
                }
            })
            .then(data => {
                // 注册成功处理
                alert(`注册成功！用户名: ${data.username}`);
                showLoginPage(); // 返回登录界面
            })
            .catch(error => {
                alert(error.message);
            });
        });

        // 处理忘记密码表单提交
        document.getElementById('forgotPasswordForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('Username').value; 
            const oldPassword = document.getElementById('oldPassword').value;
            const newPassword1 = document.getElementById('newPassword1').value;
            const newPassword2 = document.getElementById('newPassword2').value;

            // 验证两次新密码是否一致（前端验证）
            if (newPassword1 !== newPassword2) {
                alert("两次输入的新密码不一致，请重新输入！");
                return;
            }

            // 构造请求数据
            const passwordData = {
                username: username,
                old_password: oldPassword,
                new_password: newPassword1
            };

            // 发送修改密码请求
            fetch('http://10.29.172.31:5000/change_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || '密码修改失败');
                    });
                }
                return response.json();
            })
            .then(data => {
                alert(data.success || '密码修改成功！');
                showLoginPage(); // 返回登录界面
            })
            .catch(error => {
                alert(error.message);
            });
        });

        // 点击用户协议链接显示协议详情页面
        userAgreementLink.addEventListener('click', (event) => {
            event.preventDefault();
            agreementModal.style.display = 'block';
        });

        // 关闭协议详情页面
        agreementModal.querySelector('.close').addEventListener('click', () => {
            agreementModal.style.display = 'none';
        });