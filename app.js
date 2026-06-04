// Lo娘灵魂塔罗 v5 — 核心控制与 WebGL 动效逻辑
(function() {
  
  // ----------------------------------------------------
  // A. Three.js WebGL 3D 粒子星空背景系统
  // ----------------------------------------------------
  class Starfield {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      
      // 移动端性能降级：减少粒子、关闭抗锯齿、限制分辨率
      const isMobile = this.width <= 820;
      
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1, 2000);
      this.camera.position.z = 500;
      
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: !isMobile });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      
      
      // 生成星场粒子（移动端降至 600 减少 2/3 GPU 负载）
      this.particleCount = isMobile ? 600 : 1800;
      this.geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(this.particleCount * 3);
      
      for (let i = 0; i < this.particleCount; i++) {
        // 扁平星系螺旋分布结构
        const r = Math.pow(Math.random(), 1.6) * 700;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * 0.35; // 限制倾角，呈薄盘状
        
        positions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
        positions[i * 3 + 1] = r * Math.sin(phi) + (Math.random() - 0.5) * 30;
        positions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
      }
      
      this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      // 使用动态 canvas 绘制无损发光圆点贴图，消除外部 PNG 依赖
      const particleTexture = this.createCircleTexture();
      
      this.material = new THREE.PointsMaterial({
        size: 3.5,
        color: 0xE5C68F, // 初始香槟金
        transparent: true,
        opacity: 0.65,
        map: particleTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      this.points = new THREE.Points(this.geometry, this.material);
      this.scene.add(this.points);
      
      // 鼠标交互控制
      this.mouseX = 0;
      this.mouseY = 0;
      this.targetMouseX = 0;
      this.targetMouseY = 0;
      
      // 颜色过渡插值
      this.currentColor = new THREE.Color(0xE5C68F);
      this.targetColor = new THREE.Color(0xE5C68F);
      
      // 转场爆发速度控制器
      this.speed = 0.5;
      this.targetSpeed = 0.5;
      
      // 翻牌爆炸粒子群
      this.burstPoints = null;
      this.burstGeometry = null;
      this.burstMaterial = null;
      this.burstCount = 250;
      this.burstVelocities = [];
      this.burstAges = [];
      
      // 监听鼠标划过
      window.addEventListener('mousemove', (e) => {
        this.targetMouseX = (e.clientX - window.innerWidth / 2) / 120;
        this.targetMouseY = (e.clientY - window.innerHeight / 2) / 120;
      });
      
      window.addEventListener('resize', () => this.onResize());
      this.animate();
    }
    
    createCircleTexture() {
      const size = 32;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      
      return new THREE.CanvasTexture(canvas);
    }
    
    onResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }
    
    triggerBoost() {
      this.targetSpeed = 4.5;
      setTimeout(() => {
        this.targetSpeed = 0.5;
      }, 850);
    }
    
    setColor(hex) {
      this.targetColor.set(hex);
    }
    
    triggerBurst() {
      if (this.burstPoints) {
        this.scene.remove(this.burstPoints);
        this.burstGeometry.dispose();
        this.burstMaterial.dispose();
      }
      
      this.burstGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(this.burstCount * 3);
      this.burstVelocities = [];
      this.burstAges = [];
      
      for (let i = 0; i < this.burstCount; i++) {
        // 卡片三维翻转中心发散
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 120; 
        
        // 随机三维方向速度向量
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const speed = Math.random() * 9 + 4;
        
        this.burstVelocities.push(
          speed * Math.sin(phi) * Math.cos(theta),
          speed * Math.sin(phi) * Math.sin(theta),
          speed * Math.cos(phi)
        );
        this.burstAges.push(0);
      }
      
      this.burstGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      this.burstMaterial = new THREE.PointsMaterial({
        size: 5.5,
        color: this.currentColor,
        transparent: true,
        opacity: 1.0,
        map: this.createCircleTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      this.burstPoints = new THREE.Points(this.burstGeometry, this.burstMaterial);
      this.scene.add(this.burstPoints);
    }
    
    pause() {
      this._paused = true;
    }

    resume() {
      if (this._paused) {
        this._paused = false;
        this.animate();
      }
    }

    animate() {
      if (this._paused) return;
      requestAnimationFrame(() => this.animate());
      
      // 速度线性插值
      this.speed += (this.targetSpeed - this.speed) * 0.06;
      
      // 星系平滑旋转
      this.points.rotation.y += 0.001 * this.speed;
      this.points.rotation.x += 0.0003 * this.speed;
      
      // 视觉位移视差
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.06;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.06;
      
      this.camera.position.x = this.mouseX * 30;
      this.camera.position.y = -this.mouseY * 30;
      this.camera.lookAt(this.scene.position);
      
      
      // 颜色平滑渐变
      this.currentColor.lerp(this.targetColor, 0.035);
      this.material.color.copy(this.currentColor);
      
      // 更新翻牌爆炸粒子群
      if (this.burstPoints) {
        const positions = this.burstGeometry.attributes.position.array;
        let allDead = true;
        
        for (let i = 0; i < this.burstCount; i++) {
          this.burstAges[i] += 1;
          if (this.burstAges[i] < 60) {
            allDead = false;
            // 三维扩散 + 空气摩擦衰减
            positions[i * 3] += this.burstVelocities[i * 3];
            positions[i * 3 + 1] += this.burstVelocities[i * 3 + 1];
            positions[i * 3 + 2] += this.burstVelocities[i * 3 + 2];
            
            this.burstVelocities[i * 3] *= 0.94;
            this.burstVelocities[i * 3 + 1] *= 0.94;
            this.burstVelocities[i * 3 + 2] *= 0.94;
          }
        }
        
        this.burstGeometry.attributes.position.needsUpdate = true;
        this.burstMaterial.opacity = Math.max(0, 1.0 - this.burstAges[0] / 60);
        
        if (allDead) {
          this.scene.remove(this.burstPoints);
          this.burstGeometry.dispose();
          this.burstMaterial.dispose();
          this.burstPoints = null;
        }
      }
      
      this.renderer.render(this.scene, this.camera);
    }
  }

  // ----------------------------------------------------
  // B. 应用程序全局状态
  // ----------------------------------------------------
  const state = {
    currentPage: 'welcome',   // welcome, quiz, card-reveal, final-report, encyclopedia
    currentSection: 0,        // 0: 过去, 1: 现在, 2: 未来
    currentQuestionIndex: 0,  // 当前答题索引 (0 - 11)
    answers: [],              // 12题用户选择 ['A', 'B', ...]
    sectionAnswers: [[], [], []],
    drawnCards: [],           // 抽中的三张牌
    unlockedCardIds: [],      // 已解锁的大阿卡纳 ID 列表
    userAge: null,            // 受访者年龄
    currentReportId: null     // 服务器保存的报告唯一 ID
  };

  // 初始化
  function init() {
    loadUnlockedCards();
    setupEventListeners();
    
    // 初始化 WebGL 星空
    const canvas = document.querySelector('.main-canvas');
    if (canvas && typeof THREE !== 'undefined') {
      window.tarotStarfield = new Starfield(canvas);
    }

    // 检测 URL 是否含有历史测算 report ID 参数
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('report');
    if (reportId) {
      // 开启加载指示
      const progressText = document.querySelector('.progress-text');
      if (progressText) progressText.textContent = "正在从服务器加载命运剧本...";
      
      fetch(`/api/get-report?id=${reportId}`)
        .then(res => {
          if (!res.ok) throw new Error("Report not found");
          return res.json();
        })
        .then(data => {
          if (data && data.drawnCards) {
            state.userAge = data.age;
            state.answers = data.answers;
            state.currentReportId = data.id;
            state.drawnCards = data.drawnCards.map(id => window.TarotData.CARDS[id]);
            
            // 自动解锁这三张牌
            data.drawnCards.forEach(id => unlockCard(id));
            
            // 直接跳转到报告页展示
            navigateTo('final-report');
          } else {
            alert("加载的测试数据格式不正确。");
            navigateTo('welcome');
          }
        })
        .catch(err => {
          console.error("加载云端数据报告失败:", err);
          alert("未找到该专属测算报告记录，已为您返回主页。");
          navigateTo('welcome');
        });
    }
    
    // 如果 URL 无参数，检测本地 LocalStorage 是否有历史测算报告 ID
    const cachedReportId = localStorage.getItem('lo_tarot_last_report');
    if (cachedReportId) {
      showHistoryPrompt(cachedReportId);
      return;
    }
    
    navigateTo('welcome');
  }

  // 展示历史缓存提示弹窗
  function showHistoryPrompt(cachedReportId) {
    const modal = document.getElementById('history-prompt-modal');
    if (!modal) {
      navigateTo('welcome');
      return;
    }
    modal.classList.add('active');

    const viewBtn = document.getElementById('btn-history-view');
    const restartBtn = document.getElementById('btn-history-restart');

    viewBtn.onclick = () => {
      modal.classList.remove('active');
      const progressText = document.querySelector('.progress-text');
      if (progressText) progressText.textContent = "正在从服务器加载命运剧本...";
      
      fetch(`/api/get-report?id=${cachedReportId}`)
        .then(res => {
          if (!res.ok) throw new Error("Report not found");
          return res.json();
        })
        .then(data => {
          if (data && data.drawnCards) {
            state.userAge = data.age;
            state.answers = data.answers;
            state.currentReportId = data.id;
            state.drawnCards = data.drawnCards.map(id => window.TarotData.CARDS[id]);
            
            // 自动解锁这三张牌
            data.drawnCards.forEach(id => unlockCard(id));
            
            // 直接跳转到报告页展示
            navigateTo('final-report');
          } else {
            localStorage.removeItem('lo_tarot_last_report');
            navigateTo('welcome');
          }
        })
        .catch(err => {
          console.error("加载缓存云端数据报告失败:", err);
          localStorage.removeItem('lo_tarot_last_report');
          navigateTo('welcome');
        });
    };

    restartBtn.onclick = () => {
      modal.classList.remove('active');
      localStorage.removeItem('lo_tarot_last_report');
      navigateTo('welcome');
    };
  }

  // ----------------------------------------------------
  // C. 基础持久化与本地收集图鉴
  // ----------------------------------------------------
  function loadUnlockedCards() {
    try {
      const stored = localStorage.getItem('lo_tarot_unlocked_cards');
      if (stored) {
        state.unlockedCardIds = JSON.parse(stored);
      } else {
        state.unlockedCardIds = [];
      }
    } catch (e) {
      console.error("Failed to load unlocked cards:", e);
      state.unlockedCardIds = [];
    }
  }

  function unlockCard(cardId) {
    if (!state.unlockedCardIds.includes(cardId)) {
      state.unlockedCardIds.push(cardId);
      try {
        localStorage.setItem('lo_tarot_unlocked_cards', JSON.stringify(state.unlockedCardIds));
      } catch (e) {
        console.error("Failed to save unlocked cards:", e);
      }
    }
  }

  // ----------------------------------------------------
  // D. 页面导航路由切换 (.exit-active / .active / .menu-bar)
  // ----------------------------------------------------
  function navigateTo(pageId) {
    state.currentPage = pageId;

    // 仅在离开视频页时暂停视频（避免导航到视频页时 pause/play 竞争条件）
    if (pageId !== 'video-intro') {
      const introVideo = document.getElementById('intro-video');
      if (introVideo) {
        introVideo.pause();
      }
    }
    
    // WebGL 场景：视频页暂停星空释放 GPU，其它页面恢复
    if (window.tarotStarfield) {
      if (pageId === 'video-intro') {
        window.tarotStarfield.pause();
      } else {
        window.tarotStarfield.resume();
        window.tarotStarfield.triggerBoost();
      }
    }

    const oldPage = document.querySelector('.page-container.section.active');
    const newPage = document.getElementById(`page-${pageId}`);

    const applyPageSwitch = () => {
      // 隐藏所有其它页面
      document.querySelectorAll('.page-container.section').forEach(el => {
        el.classList.remove('active', 'exit-active');
        el.style.display = 'none';
      });

      if (newPage) {
        newPage.style.display = 'flex';

        // 视频页跳过 CSS 过渡动画，直接瞬切黑底，避免 GPU 同时处理动画+解码
        if (pageId === 'video-intro') {
          newPage.style.transition = 'none';
          newPage.style.opacity = '1';
          newPage.style.transform = 'translateY(0)';
          newPage.classList.add('active');
          // 下一帧恢复 transition 以便离开时正常
          requestAnimationFrame(() => { newPage.style.transition = ''; });
        } else {
          // 强制浏览器回流渲染布局以启动 transition 动画
          newPage.offsetHeight;
          newPage.classList.add('active');
        }
        window.scrollTo(0, 0);
      }

      // 触发页面定制逻辑
      if (pageId === 'welcome') {
        resetQuizState();
        triggerWelcomeLetterAnimation();
      } else if (pageId === 'video-intro') {
        const videoEl = document.getElementById('intro-video');
        const overlay = document.getElementById('video-loading-overlay');
        if (videoEl) {
          videoEl.currentTime = 0;
          // 显示加载遮罩
          if (overlay) { overlay.style.opacity = '1'; overlay.style.display = 'flex'; }

          const startPlayback = () => {
            // 淡出加载遮罩
            if (overlay) {
              overlay.style.opacity = '0';
              setTimeout(() => { overlay.style.display = 'none'; overlay.style.opacity = '1'; }, 400);
            }
            videoEl.play().catch(e => console.log('Autoplay blocked:', e));
          };

          // 等待视频缓冲就绪（readyState >= 3 = HAVE_FUTURE_DATA）
          if (videoEl.readyState >= 3) {
            startPlayback();
          } else {
            videoEl.addEventListener('canplay', startPlayback, { once: true });
            videoEl.load(); // preload="metadata" 仅加载元数据，此处触发全量缓冲
          }
        }
      } else if (pageId === 'quiz') {
        renderCurrentQuestion();
      } else if (pageId === 'final-report') {
        renderFinalReport();
      } else if (pageId === 'encyclopedia') {
        renderEncyclopedia();
      }

      // 更新垂直菜单导航条位置
      updateNavigationMenu(pageId);
    };

    if (oldPage && oldPage !== newPage) {
      oldPage.classList.add('exit-active');
      // 延迟 450ms 让淡出动画完成
      setTimeout(applyPageSwitch, 450);
    } else {
      applyPageSwitch();
    }
  }

  // 重置答题
  function resetQuizState() {
    state.currentSection = 0;
    state.currentQuestionIndex = 0;
    state.answers = [];
    state.sectionAnswers = [[], [], []];
    state.drawnCards = [];
    state.currentReportId = null;
    state.userAge = null;
    localStorage.removeItem('lo_tarot_last_report');

    // 清空年龄输入框并移去错误警告样式
    const ageInput = document.getElementById('user-age-input');
    if (ageInput) {
      ageInput.value = '';
      ageInput.classList.remove('error-glow');
    }

    // 清理 URL 携带的 ?report=xxx 参数，防止点击重新测试时，刷新导致再次加载旧报告
    if (window.history && window.history.replaceState) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
    
    // 隐藏/置灰导航菜单里的 DECK 栏目
    document.getElementById('menu-item-deck')?.classList.add('disabled');
    document.getElementById('mobile-menu-item-deck')?.classList.add('disabled');
    
    // 重置进度条 scaleY
    const progressFill = document.querySelector('.progress-bar__progress');
    if (progressFill) progressFill.style.transform = `scaleY(0)`;
    
    // 重置 WebGL 粒子颜色为香槟金
    if (window.tarotStarfield) {
      window.tarotStarfield.setColor('#E5C68F');
    }
  }

  // 欢迎页字母独立入场效果
  function triggerWelcomeLetterAnimation() {
    const letters = document.querySelectorAll('.section__title-letter');
    letters.forEach((letter, index) => {
      letter.style.opacity = '0';
      letter.style.transform = 'translateY(15px)';
      letter.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      
      setTimeout(() => {
        letter.style.opacity = '1';
        letter.style.transform = 'translateY(0)';
      }, 200 + index * 65);
    });
  }

  // 更新左侧垂直菜单与进度条
  function updateNavigationMenu(pageId) {
    // 1. 设置活动菜单项高亮
    document.querySelectorAll('.menu__item, .menu-mobile__item').forEach(item => {
      if (item.getAttribute('data-page') === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 2. 答题时隐藏左侧悬浮菜单，提供专注度；其余页面浮现
    const desktopMenu = document.querySelector('.menu__desktop');
    if (desktopMenu) {
      if (pageId === 'quiz' || pageId === 'card-reveal') {
        desktopMenu.classList.remove('active');
      } else {
        desktopMenu.classList.add('active');
      }
    }

    // 3. 计算左侧滑动跟随线 (.menu__item-bar)
    setTimeout(() => {
      const activeItem = document.querySelector('.menu__desktop .menu__item.active');
      const bar = document.querySelector('.menu__item-bar');
      if (activeItem && bar) {
        const Y = activeItem.offsetTop;
        const H = activeItem.offsetHeight;
        bar.style.transform = `translateY(${Y - 36}px)`;
        bar.style.height = `${H}px`;
      }
    }, 100);
  }

  // ----------------------------------------------------
  // E. 贝叶斯抽牌核心算法
  // ----------------------------------------------------
  function calculateLogProbability(answers, card, sectionIdx) {
    const qStart = sectionIdx * 4;
    let logProb = 0;

    for (let i = 0; i < 4; i++) {
      const qIdx = qStart + i;
      const question = window.TarotData.QUESTIONS[qIdx];
      const userAnsKey = answers[i];

      const dots = {};
      let maxDot = -Infinity;
      
      for (let opt of question.options) {
        let dot = 0;
        for (let k = 0; k < 5; k++) {
          dot += card.weights[k] * opt.vector[k];
        }
        dots[opt.key] = dot;
        if (dot > maxDot) maxDot = dot;
      }

      let sumExp = 0;
      for (let opt of question.options) {
        sumExp += Math.exp(dots[opt.key] - maxDot);
      }

      const targetExp = Math.exp(dots[userAnsKey] - maxDot);
      const prob = targetExp / sumExp;

      logProb += Math.log(prob + 0.001); // Laplace 平滑
    }
    return logProb;
  }

  function drawCardForSection(sectionAnswers, usedCardIds, sectionIdx) {
    let bestCardId = -1;
    let maxLogProb = -Infinity;
    const allCards = window.TarotData.CARDS;

    for (let card of allCards) {
      if (usedCardIds.includes(card.id)) continue; 

      const logProb = calculateLogProbability(sectionAnswers, card, sectionIdx);
      if (logProb > maxLogProb) {
        maxLogProb = logProb;
        bestCardId = card.id;
      }
    }
    return bestCardId;
  }

  // ----------------------------------------------------
  // F. 渲染答题页与逻辑
  // ----------------------------------------------------
  function renderCurrentQuestion() {
    const qIdx = state.currentQuestionIndex;
    const question = window.TarotData.QUESTIONS[qIdx];
    if (!question) return;

    // 右侧精细垂直进度线比例渲染 (scaleY)
    const progressPercent = (qIdx + 1) / 12;
    const progressFill = document.querySelector('.progress-bar__progress');
    if (progressFill) {
      progressFill.style.transform = `scaleY(${progressPercent})`;
    }

    // 更新页面进度条文本提示
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
      const sectionNames = ['CHAPTER I : PAST', 'CHAPTER II : PRESENT', 'CHAPTER III : FUTURE'];
      progressText.textContent = `${sectionNames[state.currentSection]} • 第 ${qIdx + 1}/12 题`;
    }

    // 渲染题目
    const questionTitle = document.querySelector('.question-title');
    if (questionTitle) questionTitle.textContent = question.text;

    // 渲染选项列表 (附带渐入动画)
    const optionsContainer = document.querySelector('.options-container');
    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      question.options.forEach((opt, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'option-button';
        btn.innerHTML = `
          <span class="option-key">${opt.key}</span>
          <span class="option-text">${opt.text}</span>
        `;
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(10px)';
        btn.style.transition = 'opacity 0.4s ease, transform 0.4s ease, border-color 0.3s, background-color 0.3s';
        
        btn.addEventListener('click', () => handleOptionClick(opt.key));
        optionsContainer.appendChild(btn);
        
        setTimeout(() => {
          btn.style.opacity = '1';
          btn.style.transform = 'translateY(0)';
        }, 100 + optIdx * 80);
      });
    }
  }

  function handleOptionClick(optionKey) {
    state.answers.push(optionKey);
    state.sectionAnswers[state.currentSection].push(optionKey);

    const nextQIndex = state.currentQuestionIndex + 1;
    const sectionEnd = (state.currentSection + 1) * 4;

    if (nextQIndex < sectionEnd) {
      state.currentQuestionIndex = nextQIndex;
      renderCurrentQuestion();
    } else {
      // 章节结束，执行贝叶斯反推生成抽牌，然后进行“长按翻牌”仪式
      const usedCardIds = state.drawnCards.map(c => c.id);
      const drawnCardId = drawCardForSection(
        state.sectionAnswers[state.currentSection],
        usedCardIds,
        state.currentSection
      );
      
      const cardData = window.TarotData.CARDS[drawnCardId];
      state.drawnCards.push(cardData);
      
      unlockCard(drawnCardId);
      
      // 进入长按翻牌揭晓页
      showCardReveal(cardData);
    }
  }

  // ----------------------------------------------------
  // G. 点击翻牌仪式实现
  // ----------------------------------------------------
  function showCardReveal(cardData) {
    navigateTo('card-reveal');

    // 克隆卡片外容器并重新注入 DOM，彻底卸载上一次绑定的监听器
    const oldWrapper = document.querySelector('.card-reveal-wrapper');
    const newWrapper = oldWrapper.cloneNode(true);
    oldWrapper.parentNode.replaceChild(newWrapper, oldWrapper);

    const cardInner = newWrapper.querySelector('.card-inner');
    const cardSymbol = newWrapper.querySelector('.card-front .card-symbol');
    const cardLoTitle = newWrapper.querySelector('.card-front .card-lo-title');
    const cardEnTitle = newWrapper.querySelector('.card-front .card-en-title');
    const cardInterpretation = document.querySelector('.reveal-interpretation');
    const actionBtn = document.getElementById('btn-reveal-action');

    // 初始化重置卡片状态
    cardInner.classList.remove('flipped');
    cardInner.style.transform = '';
    
    const interpretationBox = document.querySelector('.reveal-interpretation-box');
    interpretationBox.style.display = 'none';
    cardInterpretation.classList.remove('visible');

    // 数据注入
    cardSymbol.innerHTML = `<img src="assets/cards/card_${cardData.id}.webp" alt="${cardData.name_zh}">`;
    cardLoTitle.textContent = cardData.name_lo;
    cardEnTitle.textContent = `${cardData.name_zh} ${cardData.name_en}`;
    cardInterpretation.innerHTML = `<p>${cardData.quote}</p>`;

    // 下一步导航配置
    if (state.currentSection === 0) {
      actionBtn.textContent = '进入第二关：现在';
      actionBtn.onclick = () => {
        state.currentSection = 1;
        state.currentQuestionIndex = 4;
        navigateTo('quiz');
      };
    } else if (state.currentSection === 1) {
      actionBtn.textContent = '进入第三关：未来';
      actionBtn.onclick = () => {
        state.currentSection = 2;
        state.currentQuestionIndex = 8;
        navigateTo('quiz');
      };
    } else {
      actionBtn.textContent = '查阅灵魂剧本综合报告';
      actionBtn.onclick = () => {
        // 解锁 DECK 菜单项
        document.getElementById('menu-item-deck')?.classList.remove('disabled');
        document.getElementById('mobile-menu-item-deck')?.classList.remove('disabled');
        navigateTo('final-report');
      };
    }

    // 绑定点击翻转事件
    newWrapper.addEventListener('click', (e) => {
      if (cardInner.classList.contains('flipped')) return;
      triggerRevealSuccess(cardInner, cardData);
    });
  }

  function triggerRevealSuccess(cardInner, cardData) {
    cardInner.classList.add('flipped');

    // 触发 Three.js 三维发散粒子波喷发，仪式感推向高潮
    if (window.tarotStarfield) {
      window.tarotStarfield.triggerBurst();
    }

    // 翻牌后 600ms 浮现文字报告和下一步跳转按钮
    setTimeout(() => {
      const interpretation = document.querySelector('.reveal-interpretation');
      interpretation.classList.add('visible');
      
      const interpretationBox = document.querySelector('.reveal-interpretation-box');
      interpretationBox.style.display = 'flex';
      interpretationBox.offsetHeight;
    }, 600);
  }

  // ----------------------------------------------------
  // H. 5D灵魂剧本解析生成与动态调色板
  // ----------------------------------------------------
  function generateSoulScriptData(card1, card2, card3) {
    const isHidden = (card1.id === 7 && card2.id === 10 && card3.id === 21);

    // 累加 5 精神内核向量
    const sumVec = [0, 0, 0, 0, 0];
    for (let i = 0; i < 5; i++) {
      sumVec[i] = card1.weights[i] + card2.weights[i] + card3.weights[i];
    }

    // 排序找出主/副/三维度轴
    const axesIndices = [0, 1, 2, 3, 4].sort((a, b) => sumVec[b] - sumVec[a]);
    const primaryIdx = axesIndices[0];
    const secondaryIdx = axesIndices[1];
    const tertiaryIdx = axesIndices[2];

    const primaryAxis = window.TarotData.AXES[primaryIdx];
    const secondaryAxis = window.TarotData.AXES[secondaryIdx];
    const tertiaryAxis = window.TarotData.AXES[tertiaryIdx];

    // 生成稳定的一致性 Hash 用于随机句型
    const answersHash = state.answers.reduce((acc, cur, idx) => acc + cur.charCodeAt(0) * (idx + 1), 0);

    const sTemplates = window.TarotData.ATOMIC_SENTENCES[primaryAxis.key];
    
    const act1Text = fillTemplate(sTemplates[0], card1);
    const act2Text = fillTemplate(sTemplates[1] || sTemplates[0], card2);
    const act3Text = fillTemplate(sTemplates[2] || sTemplates[0], card3);

    const trans1 = window.TarotData.TRANSITIONS[0]
      .replace(/\[主轴\]/g, primaryAxis.name)
      .replace(/\[副轴\]/g, secondaryAxis.name);

    const trans2 = window.TarotData.TRANSITIONS[1]
      .replace(/\[主轴\]/g, primaryAxis.name)
      .replace(/\[副轴\]/g, secondaryAxis.name);

    const trans3 = window.TarotData.TRANSITIONS[2]
      .replace(/\[主轴\]/g, primaryAxis.name)
      .replace(/\[副轴\]/g, secondaryAxis.name)
      .replace(/\[三轴\]/g, tertiaryAxis.name);

    const closingText = `你不是“${primaryAxis.notLabel}”。你是一个“${primaryAxis.coreDef}”的人。`;
    const motto = window.TarotData.MOTTOS[primaryAxis.key][answersHash % 5];

    return {
      isHidden,
      primaryAxis,
      secondaryAxis,
      tertiaryAxis,
      motto,
      act1Text,
      act2Text,
      act3Text,
      act1Title: `第一幕：【${card1.name_zh} / ${card1.name_lo}】`,
      act1Body: `${act1Text}\n${card1.quote}`,
      trans1,
      act2Title: `第二幕：【${card2.name_zh} / ${card2.name_lo}】`,
      act2Body: `${act2Text}\n${card2.quote}`,
      trans2,
      act3Title: `第三幕：【${card3.name_zh} / ${card3.name_lo}】`,
      act3Body: `${act3Text}\n${card3.quote}`,
      trans3,
      closingText,
      finalClosing: `你的灵魂剧本，是关于【${primaryAxis.name}】的剧本。`
    };
  }

  // 填充模板辅助函数
  function fillTemplate(template, card) {
    return template.replace(/\[牌名\]/g, card.name_zh)
                   .replace(/\[副标题\]/g, card.name_lo);
  }

  // 文本自动换行计算辅助函数
  function getWrappedLines(ctx, text, maxWidth) {
    const words = text.split('');
    let lines = [];
    let line = '';
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n];
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n];
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    return lines;
  }

  // 辅助十六进制转换
  function hexToRgbString(hex) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  // 渲染完成报告页
  function renderFinalReport() {
    const c1 = state.drawnCards[0];
    const c2 = state.drawnCards[1];
    const c3 = state.drawnCards[2];
    if (!c1 || !c2 || !c3) return;

    const reportData = generateSoulScriptData(c1, c2, c3);

    // 1. 设置 5D 动态调色板
    const root = document.documentElement;
    const colorMap = {
      a1: '#F8C8D8', // 自我接纳: 樱花粉
      a2: '#F5E6D3', // 平凡不凡: 米杏色
      a3: '#D0A0FF', // 不迎合: 霓虹浅紫
      a4: '#C8A2C0', // 圈层即家: 玫瑰金
      a5: '#E5C68F'  // 配得上美好: 香槟金
    };
    const primaryKey = reportData.primaryAxis.key;
    const themeColor = colorMap[primaryKey] || '#E5C68F';
    
    // 更新 CSS 原生变量，触发 UI 变色
    root.style.setProperty('--dynamic-theme-color', themeColor);
    root.style.setProperty('--dynamic-theme-color-rgb', hexToRgbString(themeColor));

    // 同步更新 WebGL 三维粒子的散射色彩
    if (window.tarotStarfield) {
      window.tarotStarfield.setColor(themeColor);
    }

    // 2. 渲染三张牌
    const cardsRow = document.querySelector('.destiny-cards-row');
    if (cardsRow) {
      cardsRow.innerHTML = `
        <div class="destiny-card">
          <div class="card-tag">过去</div>
          <div class="card-symbol"><img src="assets/cards/card_${c1.id}.webp" alt="${c1.name_zh}"></div>
          <div class="card-lo-title">${c1.name_lo}</div>
          <div class="card-en-title">${c1.name_zh} ${c1.name_en}</div>
        </div>
        <div class="destiny-card">
          <div class="card-tag">现在</div>
          <div class="card-symbol"><img src="assets/cards/card_${c2.id}.webp" alt="${c2.name_zh}"></div>
          <div class="card-lo-title">${c2.name_lo}</div>
          <div class="card-en-title">${c2.name_zh} ${c2.name_en}</div>
        </div>
        <div class="destiny-card">
          <div class="card-tag">未来</div>
          <div class="card-symbol"><img src="assets/cards/card_${c3.id}.webp" alt="${c3.name_zh}"></div>
          <div class="card-lo-title">${c3.name_lo}</div>
          <div class="card-en-title">${c3.name_zh} ${c3.name_en}</div>
        </div>
      `;
    }

    // 3. 渲染剧本正文
    const scriptBody = document.querySelector('.script-body-content');
    if (scriptBody) {
      if (reportData.isHidden) {
        scriptBody.innerHTML = `
          <div class="hidden-trigger-effect">
            <span class="sparkle">✦</span> [ 稀有度：0.3% (隐藏款) ] <span class="sparkle">✦</span>
          </div>
          <div class="script-paragraph hidden-script-style">
            <p>“你曾以为命运是外在的剧本。</p>
            <p>现在你明白——命运是你与时间的关系。</p>
            <p>别人等不到的东西，你等到了。</p>
            <p>不是因为你运气好，是因为你愿意等。</p>
            <p>愿意等的人，宇宙总会回应。</p>
            <p>你是时间的盟友，不是它的奴隶。</p>
            <p>你配得上这世界的任何馈赠，因为你懂得，馈赠是给那些不急的人。”</p>
          </div>
        `;
      } else {
        scriptBody.innerHTML = `
          <div class="script-header">你的灵魂剧本，是一场关于「${reportData.primaryAxis.theme}」的旅程。</div>
          
          <div class="act-section">
            <div class="act-title">${reportData.act1Title}</div>
            <div class="act-text">${reportData.act1Body.replace(/\n/g, '<br>')}</div>
          </div>

          <div class="transition-text">${reportData.trans1}</div>

          <div class="act-section">
            <div class="act-title">${reportData.act2Title}</div>
            <div class="act-text">${reportData.act2Body.replace(/\n/g, '<br>')}</div>
          </div>

          <div class="transition-text">${reportData.trans2}</div>

          <div class="act-section">
            <div class="act-title">${reportData.act3Title}</div>
            <div class="act-text">${reportData.act3Body.replace(/\n/g, '<br>')}</div>
          </div>

          <div class="transition-text">${reportData.trans3}</div>

          <div class="script-footer">
            <p>${reportData.closingText}</p>
            <p class="final-bold">${reportData.finalClosing}</p>
          </div>
        `;
      }
    }

    // 4. 渲染灵魂信物金句
    const mottoText = document.querySelector('.motto-quote-text');
    if (mottoText) {
      mottoText.textContent = reportData.isHidden ? "我等的不是结果，是我准备好的那一刻。" : reportData.motto;
    }

    // 延迟渲染海报图片缓存
    setTimeout(() => {
      generateSharePoster(reportData, c1, c2, c3);
    }, 550);

    // 如果是全新测算（而非通过链接读取历史报告），将答题数据异步提交至后端保存
    if (!state.currentReportId) {
      const payload = {
        age: state.userAge,
        answers: state.answers,
        drawnCards: state.drawnCards.map(c => c.id),
        primaryAxis: reportData.primaryAxis.name
      };

      fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Server responded with error");
        return res.json();
      })
      .then(data => {
        if (data && data.success && data.reportId) {
          state.currentReportId = data.reportId;
          console.log("测算剧本已成功保存至服务器，测算 ID 为:", data.reportId);
          
          // 将答题报告的 ID 缓存到本地，供下一次访问时检测
          localStorage.setItem('lo_tarot_last_report', data.reportId);
          
          // 在地址栏静默追加 ?report=xxx 属性，以便用户直接复制浏览器地址栏链接进行分享
          if (window.history && window.history.replaceState) {
            const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?report=${data.reportId}`;
            window.history.replaceState({ path: shareUrl }, '', shareUrl);
          }
        }
      })
      .catch(err => {
        console.error("向服务器提交测算报告失败:", err);
      });
    }
  }

  // ----------------------------------------------------
  // I. Canvas 海报合成生成器
  // ----------------------------------------------------
  function generateSharePoster(reportData, c1, c2, c3) {
    const canvas = document.getElementById('share-poster-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = 800;
    const H = 1200;
    const SCALE = 2; // 2倍高分像素绘制，确保高清保存与Retina显示器清晰度
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;

    // 应用变换缩放，后续绘图坐标无需调整
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(SCALE, SCALE);

    // A. 绘制深邃背景
    ctx.fillStyle = '#0C0714';
    ctx.fillRect(0, 0, W, H);

    // 绘制基于核心维度的霓虹虚光背景
    const gradColor = getComputedStyle(document.documentElement).getPropertyValue('--dynamic-theme-color').trim() || '#E5C68F';
    const radialGrad = ctx.createRadialGradient(W/2, H/2, 60, W/2, H/2, 650);
    radialGrad.addColorStop(0, hexToRgba(gradColor, 0.16));
    radialGrad.addColorStop(1, 'rgba(12, 7, 20, 0)');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, W, H);

    // 随机微弱背景星点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    const seed = state.answers.reduce((acc, val) => acc + val.charCodeAt(0), 15);
    for (let i = 0; i < 40; i++) {
      const x = (Math.sin(seed + i) * 0.5 + 0.5) * W;
      const y = (Math.cos(seed * i) * 0.5 + 0.5) * H;
      const r = (Math.sin(i) * 0.5 + 0.5) * 2 + 0.8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // B. OHZI 几何精密描边边框
    ctx.strokeStyle = hexToRgba(gradColor, 0.55);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    ctx.strokeStyle = hexToRgba(gradColor, 0.18);
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // 绘制装饰四芒星
    drawStar(ctx, 40, 40, 6, 12, 3.5, gradColor);
    drawStar(ctx, W - 40, 40, 6, 12, 3.5, gradColor);
    drawStar(ctx, 40, H - 40, 6, 12, 3.5, gradColor);
    drawStar(ctx, W - 40, H - 40, 6, 12, 3.5, gradColor);

    // C. 标题与说明 (Richer Archetype Subtitles)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px "Noto Serif SC", "Source Han Serif CN", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ 我的 Lo 娘灵魂剧本 ✦', W/2, 85);

    ctx.fillStyle = gradColor;
    ctx.font = 'bold 22px "Noto Serif SC", serif';
    ctx.fillText(`灵魂本源：${reportData.primaryAxis.name}`, W/2, 130);

    ctx.fillStyle = hexToRgba('#F5E6D3', 0.85);
    ctx.font = 'italic 16px "Source Han Sans CN", sans-serif';
    ctx.fillText(`「 核心本性：${reportData.primaryAxis.coreDef} 」`, W/2, 165);

    // E. 饰线
    ctx.strokeStyle = hexToRgba(gradColor, 0.25);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 525);
    ctx.lineTo(W - 100, 525);
    ctx.stroke();

    // F. 信物金句框
    const quoteY = 590;
    ctx.fillStyle = 'rgba(229, 198, 143, 0.04)';
    ctx.fillRect(100, quoteY - 50, W - 200, 100);
    ctx.strokeStyle = hexToRgba(gradColor, 0.25);
    ctx.strokeRect(100, quoteY - 50, W - 200, 100);

    // 装饰性大双引号
    ctx.fillStyle = hexToRgba(gradColor, 0.25);
    ctx.font = '80px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('“', 120, quoteY - 10);
    ctx.textAlign = 'right';
    ctx.fillText('”', W - 120, quoteY + 60);

    // 金句文本
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 22px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    
    const motto = reportData.isHidden ? "我等的不是结果，是我准备好的那一刻。" : reportData.motto;
    ctx.fillText(motto, W/2, quoteY + 5);

    // G. 剧本文字精选包 (Richer Content 3: Structured Acts)
    let acts = [];
    if (reportData.isHidden) {
      acts = [
        { title: '✦ 命运之章 • 时间之盟', text: '你曾以为命运是外在的剧本，现在你明白——命运是你与时间的关系。' },
        { title: '✦ 守护之章 • 宇宙回应', text: '别人等不到的东西，你等到了。不是因为你运气好，是因为你愿意等。' },
        { title: '✦ 自由之章 • 意愿领受', text: '愿意等的人，宇宙总会回应。你配得上这世界的任何馈赠，因为你懂得，馈赠是给那些不急的人。' }
      ];
    } else {
      acts = [
        { title: '✦ 第一幕 • 过去起点', text: reportData.act1Text.replace(/【|】/g, '') },
        { title: '✦ 第二幕 • 当下同行', text: reportData.act2Text.replace(/【|】/g, '') },
        { title: '✦ 第三幕 • 未来寻真', text: reportData.act3Text.replace(/【|】/g, '') }
      ];
    }

    let currentY = 675;
    acts.forEach(act => {
      // Draw act title in theme gold
      ctx.fillStyle = gradColor;
      ctx.font = 'bold 16px "Noto Serif SC", "Source Han Serif CN", serif';
      ctx.textAlign = 'left';
      ctx.fillText(act.title, 100, currentY);

      // Draw act text in cream white
      ctx.fillStyle = '#F5E6D3';
      ctx.font = '14px "Source Han Sans CN", sans-serif';
      const wrappedLines = getWrappedLines(ctx, act.text, W - 200);
      let textY = currentY + 26;
      wrappedLines.forEach(line => {
        ctx.fillText(line, 100, textY);
        textY += 24;
      });
      currentY = textY + 14; // Space to next act
    });

    // Draw final closing (启示)
    currentY += 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px "Source Han Sans CN", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(reportData.closingText, W/2, currentY);

    // H. 水印底部
    ctx.strokeStyle = hexToRgba(gradColor, 0.25);
    ctx.beginPath();
    ctx.moveTo(100, 1080);
    ctx.lineTo(W - 100, 1080);
    ctx.stroke();

    ctx.fillStyle = hexToRgba('#F5E6D3', 0.45);
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('以上剧本基于你的选择生成，仅供娱乐与自我探索。', W/2, 1115);
    ctx.fillText('扫码或搜索「Lo娘灵魂塔罗」解密你的灵魂剧本', W/2, 1145);

    // D. 异步加载及绘制命运三卡片
    const cards = [
      { label: '过去', data: c1, x: 160 },
      { label: '现在', data: c2, x: 400 },
      { label: '未来', data: c3, x: 640 }
    ];

    function loadCardImage(src) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    }

    Promise.all(cards.map(item => loadCardImage(`assets/cards/card_${item.data.id}.webp`)))
      .then(images => {
        cards.forEach((item, index) => {
          const cx = item.x;
          const cy = 330;
          const cardW = 180;
          const cardH = 260;
          const img = images[index];

          // 磨砂暗底
          ctx.fillStyle = 'rgba(16, 9, 28, 0.75)';
          ctx.fillRect(cx - cardW/2, cy - cardH/2, cardW, cardH);

          if (img) {
            // 绘制卡面插图
            ctx.drawImage(img, cx - cardW/2, cy - cardH/2, cardW, cardH);
          }

          // 卡边双层描金 (Richer borders)
          ctx.strokeStyle = hexToRgba(gradColor, 0.4);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx - cardW/2, cy - cardH/2, cardW, cardH);

          ctx.strokeStyle = hexToRgba(gradColor, 0.15);
          ctx.lineWidth = 1;
          ctx.strokeRect(cx - cardW/2 - 4, cy - cardH/2 - 4, cardW + 8, cardH + 8);

          // 上标签 (移动至卡牌外部上方，避免遮挡牌面)
          ctx.fillStyle = hexToRgba(gradColor, 0.85);
          ctx.font = 'bold 15px "Source Han Sans CN", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`— ${item.label} —`, cx, cy - cardH/2 - 15);

          // Card Labels underneath (Richer card subtitles)
          ctx.fillStyle = '#F5E6D3';
          ctx.font = 'bold 16px "Noto Serif SC", serif';
          ctx.fillText(item.data.name_lo, cx, cy + cardH/2 + 22);

          ctx.fillStyle = hexToRgba('#F5E6D3', 0.5);
          ctx.font = '12px "Source Han Sans CN", sans-serif';
          ctx.fillText(`${item.data.name_zh} • ${item.data.name_en}`, cx, cy + cardH/2 + 40);

          if (!img) {
            // 仅在图片加载失败降级使用 Emoji 符号
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '64px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
            ctx.fillText(item.data.symbol, cx, cy);
          }
        });

        // 导出 Canvas 数据到隐藏的 Image 标签以供长按保存
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const posterImg = document.getElementById('share-poster-img');
          if (posterImg) {
            posterImg.src = dataUrl;
          }
        } catch (err) {
          console.error("Failed to export poster canvas to image:", err);
        }
      });
  }

  // ----------------------------------------------------
  // J. 百科图鉴与细节解读
  // ----------------------------------------------------
  function renderEncyclopedia() {
    const listContainer = document.querySelector('.encyclopedia-cards-grid');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const allCards = window.TarotData.CARDS;

    const unlockedCount = state.unlockedCardIds.length;
    const progressText = document.querySelector('.unlock-progress-text');
    if (progressText) {
      progressText.textContent = `已解锁收集：${unlockedCount} / 22 张大阿卡纳 (${Math.round(unlockedCount/22*100)}%)`;
    }

    allCards.forEach(card => {
      const isUnlocked = state.unlockedCardIds.includes(card.id);
      const cardEl = document.createElement('div');
      cardEl.className = `encyclopedia-card-wrapper ${isUnlocked ? 'unlocked' : 'locked'}`;
      
      if (isUnlocked) {
        cardEl.innerHTML = `
          <div class="enc-card-symbol"><img src="assets/cards/card_${card.id}.webp" alt="${card.name_zh}"></div>
          <div class="enc-card-lo-title">${card.name_lo}</div>
          <div class="enc-card-zh-title">${card.name_zh}</div>
        `;
        cardEl.addEventListener('click', () => showEncyclopediaModal(card));
      } else {
        cardEl.innerHTML = `
          <div class="enc-card-symbol">❓</div>
          <div class="enc-card-lo-title">未解锁</div>
          <div class="enc-card-zh-title">${card.name_zh} ${card.name_en}</div>
        `;
        cardEl.addEventListener('click', () => {
          alert("这张牌尚未解锁。继续去进行灵魂探索测试，即可解锁更多的塔罗牌！");
        });
      }
      listContainer.appendChild(cardEl);
    });
  }

  function showEncyclopediaModal(card) {
    const modal = document.getElementById('encyclopedia-modal');
    if (!modal) return;

    const img = modal.querySelector('#modal-card-img');
    if (img) {
      img.src = `assets/cards/card_${card.id}.webp`;
      img.alt = card.name_zh;
    }
    modal.querySelector('.modal-lo-title').textContent = card.name_lo;
    modal.querySelector('.modal-en-title').textContent = `${card.name_zh} ${card.name_en}`;
    modal.querySelector('.modal-desc').innerHTML = `<p>${card.quote}</p>`;
    
    modal.classList.add('active');
  }

  // ----------------------------------------------------
  // K. 辅助与计算函数
  // ----------------------------------------------------
  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n];
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // ----------------------------------------------------
  // L. 监听绑定与控制器注册
  // ----------------------------------------------------
  function setupEventListeners() {
    
    // 1. 开始测试按钮 (附带受访者年龄验证与警告提示)
    const btnStart = document.getElementById('btn-start-quiz');
    const ageInput = document.getElementById('user-age-input');
    if (btnStart && ageInput) {
      btnStart.addEventListener('click', () => {
        const privacyCheckbox = document.getElementById('privacy-checkbox');
        if (privacyCheckbox && !privacyCheckbox.checked) {
          alert("请先阅读并勾选同意隐私声明与免责协议。");
          return;
        }

        const ageVal = ageInput.value.trim();
        const ageNum = parseInt(ageVal, 10);

        // 验证年龄是否在合理区间 (5 - 100岁)
        if (!ageVal || isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
          ageInput.classList.add('error-glow');
          // 800ms 抖动红光警告结束后移除样式，以便用户重新输入
          setTimeout(() => {
            ageInput.classList.remove('error-glow');
          }, 800);
          return;
        }

        state.userAge = ageNum;
        navigateTo('video-intro');
      });
    }

    // 2. 左侧/移动菜单导航点击跳转
    document.querySelectorAll('.menu__item, .menu-mobile__item').forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-page');
        if (pageId && !btn.classList.contains('disabled')) {
          navigateTo(pageId);
          // 关闭移动端弹出菜单
          document.querySelector('.menu-mobile').classList.remove('active');
        }
      });
    });

    // 3. 下载/保存海报按钮
    const btnDownload = document.getElementById('btn-download-poster');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        const canvas = document.getElementById('share-poster-canvas');
        if (canvas) {
          try {
            const url = canvas.toDataURL('image/png');
            
            // 判断微信环境
            const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
            if (isWeChat) {
              const saveImg = document.getElementById('poster-save-img');
              if (saveImg) {
                saveImg.src = url;
              }
              const saveModal = document.getElementById('poster-save-modal');
              if (saveModal) {
                saveModal.classList.add('active');
              }
            } else {
              // 普通浏览器：使用 a 标签下载
              const a = document.createElement('a');
              a.href = url;
              a.download = `Lo娘灵魂剧本-${state.drawnCards.map(c => c.name_zh).join('-')}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          } catch (e) {
            console.error("Poster download/save failed:", e);
            alert("海报生成失败，请长按海报卡片或使用手机截图保存。");
          }
        }
      });
    }

    // 微信海报弹窗关闭按钮绑定
    const btnClosePoster = document.getElementById('btn-close-poster-modal');
    if (btnClosePoster) {
      btnClosePoster.addEventListener('click', () => {
        document.getElementById('poster-save-modal').classList.remove('active');
      });
    }
    const btnClosePosterCta = document.getElementById('btn-close-poster-modal-cta');
    if (btnClosePosterCta) {
      btnClosePosterCta.addEventListener('click', () => {
        document.getElementById('poster-save-modal').classList.remove('active');
      });
    }

    // 全局防右键菜单（右键/长按），但对海报图片白名单放行
    document.addEventListener('contextmenu', (e) => {
      if (e.target && (e.target.id === 'poster-save-img' || e.target.id === 'share-poster-img')) {
        return; // 允许长按保存海报
      }
      e.preventDefault();
    });

    // 4. 重测 / 百科 / 百科关闭
    document.querySelectorAll('.btn-go-home').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo('welcome');
      });
    });

    document.querySelectorAll('.btn-go-encyclopedia').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo('encyclopedia');
      });
    });

    const btnBackQuiz = document.getElementById('btn-back-quiz');
    if (btnBackQuiz) {
      btnBackQuiz.addEventListener('click', () => {
        navigateTo('welcome');
      });
    }

    const btnCloseModal = document.getElementById('btn-close-modal');
    const modal = document.getElementById('encyclopedia-modal');
    if (btnCloseModal && modal) {
      btnCloseModal.addEventListener('click', () => {
        modal.classList.remove('active');
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }

    // 6. 百科大图高清下载
    const btnDownloadCard = document.getElementById('btn-download-card');
    if (btnDownloadCard) {
      btnDownloadCard.addEventListener('click', () => {
        const img = document.getElementById('modal-card-img');
        const modal = document.getElementById('encyclopedia-modal');
        if (img && img.src && modal) {
          const loTitle = modal.querySelector('.modal-lo-title').textContent;
          const enTitle = modal.querySelector('.modal-en-title').textContent;
          try {
            const a = document.createElement('a');
            a.href = img.src;
            a.download = `Lo娘灵魂塔罗-${loTitle}-${enTitle.split(' ')[0]}.webp`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (e) {
            console.error("Card download failed:", e);
            alert("图片下载失败，您可以长按弹窗中的卡牌图片进行保存。");
          }
        }
      });
    }

    // 5. 分享话术 (升级为一键复制专属测算链接)
    const btnShareReport = document.getElementById('btn-share-report');
    if (btnShareReport) {
      btnShareReport.addEventListener('click', () => {
        if (state.currentReportId) {
          const shareUrl = `${window.location.origin}${window.location.pathname}?report=${state.currentReportId}`;
          
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl)
              .then(() => {
                alert(`您的专属灵魂剧本分享链接已生成并复制到剪贴板！\n您可以直接粘贴发送给好友进行分享：\n\n${shareUrl}`);
              })
              .catch(err => {
                window.prompt("链接复制失败，请复制下方专属链接进行分享：", shareUrl);
              });
          } else {
            window.prompt("专属链接已生成，请复制下方链接进行分享：", shareUrl);
          }
        } else {
          alert("正在生成云端测算档案中，请稍候...");
        }
      });
    }

    // 7. 视频引导页逻辑：结束跳转与手动跳过
    const video = document.getElementById('intro-video');
    if (video) {
      let videoNavigated = false;
      const goToQuiz = () => {
        if (videoNavigated) return;
        videoNavigated = true;
        navigateTo('quiz');
      };
      video.addEventListener('ended', goToQuiz);
      // 后备：如果 ended 事件未触发，在视频最后 0.3 秒自动跳转
      video.addEventListener('timeupdate', () => {
        if (video.duration && video.currentTime >= video.duration - 0.3) {
          video.pause();
          goToQuiz();
        }
      });
      // 每次重新进入视频页时重置跳转标记
      video.addEventListener('play', () => { videoNavigated = false; });
    }
    const btnSkipVideo = document.getElementById('btn-skip-video');
    if (btnSkipVideo && video) {
      btnSkipVideo.addEventListener('click', () => {
        video.pause();
        navigateTo('quiz');
      });
    }
  }

  // 挂载用于测试或调试
  window.TarotApp = {
    init,
    state,
    calculateLogProbability,
    drawCardForSection,
    generateSoulScriptData,
    navigateTo
  };

  document.addEventListener('DOMContentLoaded', init);
})();
