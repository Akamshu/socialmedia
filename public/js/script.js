async function analyze() {
    const keyword = document.getElementById("keyword").value;
    const loadingEl = document.getElementById("loading");
    const resultsEl = document.getElementById("results");
    const placeholderEl = document.getElementById("results-placeholder");

    if (!keyword.trim()) {
        alert("Please enter a search keyword.");
        return;
    }

    // Reset layout states & show professional loader
    resultsEl.classList.add("hidden");
    if (placeholderEl) placeholderEl.classList.add("hidden");
    loadingEl.classList.remove("hidden");
    loadingEl.classList.add("flex");

    try {
        const response = await fetch(`/analyze/${encodeURIComponent(keyword)}`);
        const data = await response.json();

        // Turn off loader
        loadingEl.classList.add("hidden");
        loadingEl.classList.remove("flex");

        if (!data || data.length === 0) {
            if (placeholderEl) {
                placeholderEl.classList.remove("hidden");
                placeholderEl.querySelector("p").textContent = "No results found";
                placeholderEl.querySelectorAll("p")[1].textContent = "Try a different search keyword.";
            }
            return;
        }

        let html = "";

        data.forEach((video, index) => {
            // Local variables cast explicitly as integers to ensure zero-division safety
            const views = parseInt(video.views) || 0;
            const likes = parseInt(video.likes) || 0;
            const comments = parseInt(video.comments) || 0;

            // --- CALCULATE ANALYTICS DATA ---
            const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
            const likeRate = views > 0 ? (likes / views) * 100 : 0;
            const commentRate = views > 0 ? (comments / views) * 100 : 0;

            let performanceGrade = "C";
            let gradeBadgeColor = "bg-zinc-100 text-zinc-800 border-zinc-200";
            let aiAnalysis = "";

            // --- UNIFIED CONDITIONAL MATRIX (GRADES, BADGES & ANALYSIS) ---
            if (engagementRate >= 10) {
                performanceGrade = "A+";
                gradeBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                aiAnalysis = "Outstanding audience engagement. This video performs exceptionally well and is highly likely to be recommended by YouTube's algorithm.";
            } else if (engagementRate >= 7) {
                performanceGrade = "A";
                gradeBadgeColor = "bg-emerald-50/60 text-emerald-600 border-emerald-100";
                aiAnalysis = "Strong engagement across views, likes and comments. The audience is interacting positively with this content.";
            } else if (engagementRate >= 5) {
                performanceGrade = "B";
                gradeBadgeColor = "bg-blue-50 text-blue-600 border-blue-100";
                aiAnalysis = "Healthy engagement with a good balance of audience reactions. Continued promotion could improve its reach.";
            } else if (engagementRate >= 3) {
                performanceGrade = "C";
                gradeBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                aiAnalysis = "This video has moderate, baseline engagement. Stable audience reaction, but structural tweaks could unlock higher reach.";
            } else {
                performanceGrade = "D";
                gradeBadgeColor = "bg-rose-50 text-rose-600 border-rose-200";
                aiAnalysis = "Low engagement relative to views. Improving the title, thumbnail, and inserting clear calls-to-action could help increase critical audience interaction.";
            }

            // Setup dynamic background badge styling for top tier content metrics
            const isFirst = index === 0;
            const rankBadgeClass = isFirst 
                ? "bg-amber-500 text-white" 
                : "bg-zinc-900/80 text-zinc-50 backdrop-blur-sm";
            const medalIcon = isFirst ? "🥇 " : "";

            // Format upload date safely if provided, fallback elegantly if missing
            const releaseDate = video.uploadDate ? new Date(video.uploadDate).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
            }) : 'Unknown date';

            html += `
                <div class="flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    
                    <!-- TOP CORE META PROFILE ROW -->
                    <div class="flex flex-col sm:flex-row items-start gap-4">
                        
                        <!-- Thumbnail Frame -->
                        <div class="relative w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-100">
                            <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-full object-cover" />
                            
                            <!-- Shadcn Unified Higher Hierarchy Rank Sticker -->
                            <span class="absolute top-2 left-2 inline-flex items-center justify-center font-mono text-xs font-bold px-2 py-0.5 rounded-md shadow-sm ${rankBadgeClass}">
                                ${medalIcon}Rank #${index + 1}
                            </span>
                        </div>

                        <!-- Text Channel Metrics Headers -->
                        <div class="flex-1 min-w-0 space-y-1">
                            <div class="flex items-start justify-between gap-2">
                                <h3 class="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2">
                                    ${video.title}
                                </h3>
                                <!-- Performance Grade Pill Tag -->
                                <span class="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${gradeBadgeColor} flex-shrink-0">
                                    Grade ${performanceGrade}
                                </span>
                            </div>
                            
                            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 font-medium">
                                <span>${video.channel}</span>
                                <span class="text-zinc-300">•</span>
                                <span>${releaseDate}</span>
                            </div>

                            <!-- Performance Stats Micro Box Matrix -->
                            <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-[11px] text-zinc-500 font-mono">
                                <!-- Views -->
                                <div class="flex items-center gap-1" title="Total Views">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-400"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                                    <span>${views.toLocaleString()}</span>
                                </div>
                                
                                <!-- Likes -->
                                <div class="flex items-center gap-1" title="Total Likes (Ratio: ${likeRate.toFixed(1)}%)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-400"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3l3.15-4.52a1.7 1.7 0 0 1 2.42-.22Z"/></svg>
                                    <span>${likes.toLocaleString()} <span class="text-[10px] text-zinc-400">(${likeRate.toFixed(1)}%)</span></span>
                                </div>

                                <!-- Comments -->
                                <div class="flex items-center gap-1" title="Total Comments (Ratio: ${commentRate.toFixed(1)}%)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    <span>${comments.toLocaleString()} <span class="text-[10px] text-zinc-400">(${commentRate.toFixed(1)}%)</span></span>
                                </div>

                                <!-- Engagement Badge Vector Indicator -->
                                <div class="flex items-center gap-1 bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-sans font-medium text-[10px]" title="Engagement Density Score Matrix">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-zinc-500"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    <span>Engagement: ${engagementRate.toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- RESTRUCTURING BASELINE FOOTER LAYOUT (AI Analysis & Watch Button) -->
                    <div class="mt-1 pt-3 border-t border-zinc-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        <!-- AI Analysis Module Pane -->
                        <div class="flex items-start gap-2 max-w-xl bg-zinc-50/70 rounded-lg p-2.5 border border-zinc-100 flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-600 flex-shrink-0 mt-0.5"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                            <p class="text-xs text-zinc-600 leading-relaxed">
                                <span class="font-semibold text-zinc-800">AI Viewpoint:</span> 
                                ${aiAnalysis}
                            </p>
                        </div>

                        <!-- Action Button Anchor Framework -->
                        <a 
                            href="${video.url || '#'}" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 h-9 px-3 gap-1.5 transition-colors shadow-sm self-end md:self-center flex-shrink-0"
                        >
                            <span>Watch</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                        </a>
                    </div>

                </div>
            `;
        });

        // Inject content and switch display wrapper on
        resultsEl.innerHTML = html;
        resultsEl.classList.remove("hidden");

    } catch (error) {
        // Handle error layout gracefully
        loadingEl.classList.add("hidden");
        loadingEl.classList.remove("flex");
        
        resultsEl.innerHTML = `
            <div class="p-4 rounded-md border border-red-200 bg-red-50 text-xs text-red-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <span>Failed to fetch and analyze video models. Please try again later.</span>
            </div>
        `;
        resultsEl.classList.remove("hidden");
        console.error(error);
    }
}



async function analyze() {
    const keyword = document.getElementById("keyword").value;
    const loadingEl = document.getElementById("loading");
    const resultsEl = document.getElementById("results");
    const placeholderEl = document.getElementById("results-placeholder");

    if (!keyword.trim()) {
        alert("Please enter a search keyword.");
        return;
    }

    // Reset layout states & show professional loader
    resultsEl.classList.add("hidden");
    if (placeholderEl) placeholderEl.classList.add("hidden");
    loadingEl.classList.remove("hidden");
    loadingEl.classList.add("flex");

    try {
        const response = await fetch(`/analyze/${encodeURIComponent(keyword)}`);
        const data = await response.json();

        // Turn off loader
        loadingEl.classList.add("hidden");
        loadingEl.classList.remove("flex");

        if (!data || data.length === 0) {
            if (placeholderEl) {
                placeholderEl.classList.remove("hidden");
                placeholderEl.querySelector("p").textContent = "No results found";
                placeholderEl.querySelectorAll("p")[1].textContent = "Try a different search keyword.";
            }
            return;
        }

        let html = "";

        data.forEach((video, index) => {
            // Local variables cast explicitly as integers to ensure zero-division safety
            const views = parseInt(video.views) || 0;
            const likes = parseInt(video.likes) || 0;
            const comments = parseInt(video.comments) || 0;

            // --- CALCULATE ANALYTICS DATA ---
            const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
            const likeRate = views > 0 ? (likes / views) * 100 : 0;
            const commentRate = views > 0 ? (comments / views) * 100 : 0;

            let performanceGrade = "C";
            let gradeBadgeColor = "bg-zinc-100 text-zinc-800 border-zinc-200";
            let aiAnalysis = "";

            // --- UNIFIED CONDITIONAL MATRIX (GRADES, BADGES & ANALYSIS) ---
            if (engagementRate >= 10) {
                performanceGrade = "A+";
                gradeBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                aiAnalysis = "Outstanding audience engagement. This video performs exceptionally well and is highly likely to be recommended by YouTube's algorithm.";
            } else if (engagementRate >= 7) {
                performanceGrade = "A";
                gradeBadgeColor = "bg-emerald-50/60 text-emerald-600 border-emerald-100";
                aiAnalysis = "Strong engagement across views, likes and comments. The audience is interacting positively with this content.";
            } else if (engagementRate >= 5) {
                performanceGrade = "B";
                gradeBadgeColor = "bg-blue-50 text-blue-600 border-blue-100";
                aiAnalysis = "Healthy engagement with a good balance of audience reactions. Continued promotion could improve its reach.";
            } else if (engagementRate >= 3) {
                performanceGrade = "C";
                gradeBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                aiAnalysis = "This video has moderate, baseline engagement. Stable audience reaction, but structural tweaks could unlock higher reach.";
            } else {
                performanceGrade = "D";
                gradeBadgeColor = "bg-rose-50 text-rose-600 border-rose-200";
                aiAnalysis = "Low engagement relative to views. Improving the title, thumbnail, and inserting clear calls-to-action could help increase critical audience interaction.";
            }

            // --- UI TEMPLATE STYLING VARIANTS ---
            const isFirst = index === 0;
            const rankBadgeClass = isFirst 
                ? "bg-amber-500 text-white" 
                : "bg-zinc-900/80 text-zinc-50 backdrop-blur-sm";
            const medalIcon = isFirst ? "🥇 " : "";

            const releaseDate = video.uploadDate ? new Date(video.uploadDate).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
            }) : 'Unknown date';

            html += `
                <div class="flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 animate-in fade-in-50">
                    
                    <!-- TOP CORE META PROFILE ROW -->
                    <div class="flex flex-col sm:flex-row items-start gap-4">
                        
                        <!-- Thumbnail Frame -->
                        <div class="relative w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-100">
                            <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-full object-cover" />
                            
                            <!-- Shadcn Top Left Position Badge -->
                            <span class="absolute top-2 left-2 inline-flex items-center justify-center font-mono text-xs font-bold px-2 py-0.5 rounded-md shadow-sm ${rankBadgeClass}">
                                ${medalIcon}Rank #${index + 1}
                            </span>
                        </div>

                        <!-- Text Channel Metrics Headers -->
                        <div class="flex-1 min-w-0 space-y-1">
                            <div class="flex items-start justify-between gap-2">
                                <h3 class="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2">
                                    ${video.title}
                                </h3>
                                <!-- Performance Grade Pill Tag -->
                                <span class="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${gradeBadgeColor} flex-shrink-0">
                                    Grade ${performanceGrade}
                                </span>
                            </div>
                            
                            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 font-medium">
                                <span>${video.channel}</span>
                                <span class="text-zinc-300">•</span>
                                <span>${releaseDate}</span>
                            </div>

                            <!-- Performance Stats Micro Box Matrix -->
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-[11px] text-zinc-500 font-mono">
                                <!-- Views -->
                                <div class="flex items-center gap-1" title="Total Views">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-400"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                                    <span>${views.toLocaleString()}</span>
                                </div>
                                
                                <!-- Likes -->
                                <div class="flex items-center gap-1" title="Total Likes (Ratio: ${likeRate.toFixed(1)}%)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-400"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3l3.15-4.52a1.7 1.7 0 0 1 2.42-.22Z"/></svg>
                                    <span>${likes.toLocaleString()} <span class="text-[10px] text-zinc-400">(${likeRate.toFixed(1)}%)</span></span>
                                </div>

                                <!-- Comments -->
                                <div class="flex items-center gap-1" title="Total Comments (Ratio: ${commentRate.toFixed(1)}%)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    <span>${comments.toLocaleString()} <span class="text-[10px] text-zinc-400">(${commentRate.toFixed(1)}%)</span></span>
                                </div>

                                <!-- Total Engagement Badge Indicator -->
                                <div class="flex items-center gap-1 bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-sans font-medium text-[10px]" title="Combined Engagement Metric">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-zinc-500"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    <span>Engagement: ${engagementRate.toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI ANALYSIS & ACTION FOOTER SECTION -->
                    <div class="mt-1 pt-3 border-t border-zinc-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        <!-- AI Analysis Module Pane -->
                        <div class="flex items-start gap-2 max-w-xl bg-zinc-50/70 rounded-lg p-2.5 border border-zinc-100 flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-500 flex-shrink-0 mt-0.5"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                            <p class="text-xs text-zinc-600 leading-relaxed">
                                <span class="font-semibold text-zinc-800">AI Analysis:</span> 
                                ${aiAnalysis}
                            </p>
                        </div>

                        <!-- Action Button Anchor Link -->
                        <a 
                            href="${video.url || '#'}" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 h-9 px-3 gap-1.5 transition-colors shadow-sm self-end md:self-center flex-shrink-0"
                        >
                            <span>Watch on YouTube</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                        </a>
                    </div>

                </div>
            `;
        });

        // Inject content and switch display wrapper on
        resultsEl.innerHTML = html;
        resultsEl.classList.remove("hidden");

    } catch (error) {
        // Handle error layout gracefully
        loadingEl.classList.add("hidden");
        loadingEl.classList.remove("flex");
        
        resultsEl.innerHTML = `
            <div class="p-4 rounded-md border border-red-200 bg-red-50 text-xs text-red-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <span>Failed to fetch and analyze video data. Please try again later.</span>
            </div>
        `;
        resultsEl.classList.remove("hidden");
        console.error(error);
    }
}
