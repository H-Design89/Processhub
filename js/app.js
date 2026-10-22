/**
 * ProcessHub - Main Application Controller
 * Handles UI state, omni-search, multi-criteria filtering, view rendering,
 * Google Drive download/preview logic, settings modal, and toast notifications.
 */

// Application State
const AppState = {
  allDocuments: [],
  filteredDocuments: [],
  searchQuery: '',
  selectedDepartment: 'all',
  selectedCategory: 'all',
  onlyFavorites: false,
  sortBy: 'updated-desc',
  viewMode: 'table', // 'grid' | 'table' (Default: table)
  groupBy: 'none',  // 'none' | 'department'
  collapsedGroups: new Set(),
  activePreviewDoc: null,
  currentUser: null
};

// DOM Elements Cache
const DOM = {};

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', async () => {
  cacheDomElements();
  initTheme();
  initLucideIcons();
  bindEventListeners();

  // Load Initial Data (from LocalStorage cache, Google Sheets, or default mock data)
  await loadInitialData();
});

/**
 * Cache common DOM elements
 */
function cacheDomElements() {
  DOM.themeIcon = document.getElementById('theme-icon');
  DOM.btnToggleTheme = document.getElementById('btn-toggle-theme');
  DOM.btnSyncData = document.getElementById('btn-sync-data');
  DOM.btnOpenSettings = document.getElementById('btn-open-settings');
  DOM.dataStatusText = document.getElementById('data-status-text');

  // Auth & User Profile
  DOM.btnOpenLogin = document.getElementById('btn-open-login');
  DOM.navUserIcon = document.getElementById('nav-user-icon');
  DOM.navUserName = document.getElementById('nav-user-name');
  DOM.modalLogin = document.getElementById('modal-login');
  DOM.btnCloseLogin = document.getElementById('btn-close-login');
  DOM.authCurrentAvatar = document.getElementById('auth-current-avatar');
  DOM.authCurrentName = document.getElementById('auth-current-name');
  DOM.authCurrentRole = document.getElementById('auth-current-role');
  DOM.authCurrentDept = document.getElementById('auth-current-dept');
  DOM.authCurrentAllowed = document.getElementById('auth-current-allowed');
  DOM.formLogin = document.getElementById('form-login');
  DOM.inputLoginUsername = document.getElementById('input-login-username');
  DOM.inputLoginPassword = document.getElementById('input-login-password');
  DOM.btnTogglePasswordVisibility = document.getElementById('btn-toggle-password-visibility');
  DOM.eyeIcon = document.getElementById('eye-icon');
  DOM.loginErrorMsg = document.getElementById('login-error-msg');
  DOM.btnSubmitLogin = document.getElementById('btn-submit-login');
  DOM.btnLogout = document.getElementById('btn-logout');

  // Search & Filter
  DOM.globalSearchInput = document.getElementById('global-search-input');
  DOM.btnClearSearch = document.getElementById('btn-clear-search');
  DOM.filterDept = document.getElementById('filter-dept');
  DOM.filterType = document.getElementById('filter-type');
  DOM.btnToggleFavoriteFilter = document.getElementById('btn-toggle-favorite-filter');
  DOM.favoriteCount = document.getElementById('favorite-count');
  DOM.btnResetFilters = document.getElementById('btn-reset-filters');
  DOM.sortBy = document.getElementById('sort-by');
  DOM.btnViewGrid = document.getElementById('btn-view-grid');
  DOM.btnViewTable = document.getElementById('btn-view-table');

  // KPI Carousel & Grouping & Export
  DOM.kpiStatsContainer = document.getElementById('kpi-stats-container');
  DOM.selectGroupBy = document.getElementById('select-group-by');
  DOM.btnExportExcel = document.getElementById('btn-export-excel');

  // Table Subhead & Summary
  DOM.tableDisplaySummary = document.getElementById('table-display-summary');
  DOM.tableDisplayCount = document.getElementById('table-display-count');
  DOM.btnToggleAllGroups = document.getElementById('btn-toggle-all-groups');
  DOM.textToggleAllGroups = document.getElementById('text-toggle-all-groups');
  DOM.tfootTotalCount = document.getElementById('tfoot-total-count');
  DOM.tfootDeptCount = document.getElementById('tfoot-dept-count');
  DOM.tfootLatestDate = document.getElementById('tfoot-latest-date');

  // Containers
  DOM.deptPillsContainer = document.getElementById('dept-pills-container');
  DOM.documentsGrid = document.getElementById('documents-grid');
  DOM.documentsTableWrapper = document.getElementById('documents-table-wrapper');
  DOM.documentsTableBody = document.getElementById('documents-table-body');
  DOM.emptyState = document.getElementById('empty-state');
  DOM.btnEmptyReset = document.getElementById('btn-empty-reset');
  DOM.currentCount = document.getElementById('current-count');
  DOM.totalCount = document.getElementById('total-count');
  DOM.activeFilterChips = document.getElementById('active-filter-chips');

  // Stats
  DOM.statTotalDocs = document.getElementById('stat-total-docs');
  DOM.statTotalDepts = document.getElementById('stat-total-depts');
  DOM.statTotalProcesses = document.getElementById('stat-total-processes');
  DOM.statTotalStandards = document.getElementById('stat-total-standards');
  DOM.statTotalInstructions = document.getElementById('stat-total-instructions');

  // Stat Card click filters
  DOM.cardFilterAll = document.getElementById('card-filter-all');
  DOM.cardFilterDepts = document.getElementById('card-filter-departments');
  DOM.cardFilterProcesses = document.getElementById('card-filter-quy-trinh');
  DOM.cardFilterStandards = document.getElementById('card-filter-quy-chuan');
  DOM.cardFilterInstructions = document.getElementById('card-filter-huong-dan');

  // Modals
  DOM.modalSettings = document.getElementById('modal-settings');
  DOM.btnCloseSettings = document.getElementById('btn-close-settings');
  DOM.btnCancelSettings = document.getElementById('btn-cancel-settings');
  DOM.btnSaveSettings = document.getElementById('btn-save-settings');
  DOM.btnTestSheet = document.getElementById('btn-test-sheet');
  DOM.inputSheetUrl = document.getElementById('input-sheet-url');
  DOM.inputSheetTab = document.getElementById('input-sheet-tab');
  DOM.sheetConnectionStatus = document.getElementById('sheet-connection-status');
  DOM.btnDownloadCsvSample = document.getElementById('btn-download-csv-sample');
  DOM.btnUseMockData = document.getElementById('btn-use-mock-data');
  DOM.btnFooterGuide = document.getElementById('btn-footer-guide');
  DOM.btnFooterTemplate = document.getElementById('btn-footer-template');

  // Add Document Modal & Controls
  DOM.btnOpenAddDoc = document.getElementById('btn-open-add-doc');
  DOM.btnToolbarAddDoc = document.getElementById('btn-toolbar-add-doc');
  DOM.modalAddDoc = document.getElementById('modal-add-doc');
  DOM.btnCloseAddDoc = document.getElementById('btn-close-add-doc');
  DOM.btnCancelAddDoc = document.getElementById('btn-cancel-add-doc');
  DOM.formAddDoc = document.getElementById('form-add-doc');
  DOM.addDocSyncStatus = document.getElementById('add-doc-sync-status');
  DOM.addDocSyncStatusText = document.getElementById('add-doc-sync-status-text');
  DOM.addDocCode = document.getElementById('add-doc-code');
  DOM.btnSuggestCode = document.getElementById('btn-suggest-code');
  DOM.addDocTitle = document.getElementById('add-doc-title');
  DOM.addDocDept = document.getElementById('add-doc-dept');
  DOM.addDocCat = document.getElementById('add-doc-cat');
  DOM.addDocVersion = document.getElementById('add-doc-version');
  DOM.addDocDate = document.getElementById('add-doc-date');
  DOM.addDocUrl = document.getElementById('add-doc-url');
  DOM.btnAddDocMoreLink = document.getElementById('btn-add-doc-more-link');
  DOM.addDocLinksContainer = document.getElementById('add-doc-links-container');
  DOM.addDocDesc = document.getElementById('add-doc-desc');
  DOM.addDocTags = document.getElementById('add-doc-tags');
  DOM.btnSubmitAddDoc = document.getElementById('btn-submit-add-doc');
  DOM.submitAddIcon = document.getElementById('submit-add-icon');
  DOM.submitAddText = document.getElementById('submit-add-text');

  // Edit Document Modal & Controls
  DOM.modalEditDoc = document.getElementById('modal-edit-doc');
  DOM.btnCloseEditDoc = document.getElementById('btn-close-edit-doc');
  DOM.btnCancelEditDoc = document.getElementById('btn-cancel-edit-doc');
  DOM.formEditDoc = document.getElementById('form-edit-doc');
  DOM.editDocSyncStatus = document.getElementById('edit-doc-sync-status');
  DOM.editDocSyncStatusText = document.getElementById('edit-doc-sync-status-text');
  DOM.editDocId = document.getElementById('edit-doc-id');
  DOM.editDocCode = document.getElementById('edit-doc-code');
  DOM.editDocTitle = document.getElementById('edit-doc-title');
  DOM.editDocDept = document.getElementById('edit-doc-dept');
  DOM.editDocCat = document.getElementById('edit-doc-cat');
  DOM.editDocVersion = document.getElementById('edit-doc-version');
  DOM.editDocDate = document.getElementById('edit-doc-date');
  DOM.editDocUrl = document.getElementById('edit-doc-url');
  DOM.btnEditDocMoreLink = document.getElementById('btn-edit-doc-more-link');
  DOM.editDocLinksContainer = document.getElementById('edit-doc-links-container');
  DOM.editDocReason = document.getElementById('edit-doc-reason');
  DOM.editDocDesc = document.getElementById('edit-doc-desc');
  DOM.editDocTags = document.getElementById('edit-doc-tags');
  DOM.btnSubmitEditDoc = document.getElementById('btn-submit-edit-doc');
  DOM.submitEditIcon = document.getElementById('submit-edit-icon');
  DOM.submitEditText = document.getElementById('submit-edit-text');

  // Delete Document Modal & Controls (Admin only)
  DOM.modalDeleteConfirm = document.getElementById('modal-delete-confirm');
  DOM.btnCloseDeleteModal = document.getElementById('btn-close-delete-modal');
  DOM.btnCancelDelete = document.getElementById('btn-cancel-delete');
  DOM.btnConfirmDelete = document.getElementById('btn-confirm-delete');
  DOM.confirmDeleteIcon = document.getElementById('confirm-delete-icon');
  DOM.confirmDeleteText = document.getElementById('confirm-delete-text');
  DOM.delDocCode = document.getElementById('del-doc-code');
  DOM.delDocTitle = document.getElementById('del-doc-title');
  DOM.delDocCategory = document.getElementById('del-doc-category');
  DOM.delDocDept = document.getElementById('del-doc-dept');
  DOM.delDocDesc = document.getElementById('del-doc-desc');

  // Preview Modal
  DOM.modalPreview = document.getElementById('modal-preview');
  DOM.btnClosePreview = document.getElementById('btn-close-preview');
  DOM.btnPreviewDelete = document.getElementById('btn-preview-delete');
  DOM.previewTitle = document.getElementById('preview-title');
  DOM.previewMeta = document.getElementById('preview-meta');
  DOM.previewBadgeCategory = document.getElementById('preview-badge-category');
  DOM.previewDesc = document.getElementById('preview-desc');
  DOM.previewCode = document.getElementById('preview-code');
  DOM.previewVersion = document.getElementById('preview-version');
  DOM.previewDept = document.getElementById('preview-dept');
  DOM.previewDate = document.getElementById('preview-date');
  DOM.previewLinksLabel = document.getElementById('preview-links-label');
  DOM.previewLinksCount = document.getElementById('preview-links-count');
  DOM.previewLinksContainer = document.getElementById('preview-links-container');
  DOM.previewDownloadLink = document.getElementById('preview-download-link');
  DOM.previewDriveView = document.getElementById('preview-drive-view');
  DOM.btnCopyLink = document.getElementById('btn-copy-link');
  DOM.btnPreviewFav = document.getElementById('btn-preview-fav');
  DOM.previewIframe = document.getElementById('preview-iframe');
  DOM.previewIframeWrapper = document.getElementById('preview-iframe-wrapper');
  DOM.previewIframeFallback = document.getElementById('preview-iframe-fallback');
  DOM.previewFallbackBtn = document.getElementById('preview-fallback-btn');

  // Version History Modal
  DOM.modalVersionHistory = document.getElementById('modal-version-history');
  DOM.btnCloseVersionHistory = document.getElementById('btn-close-version-history');
  DOM.vhDocCode = document.getElementById('vh-doc-code');
  DOM.vhDocTitle = document.getElementById('vh-doc-title');
  DOM.vhDocCategory = document.getElementById('vh-doc-category');
  DOM.vhDocDept = document.getElementById('vh-doc-dept');
  DOM.vhActiveVersionTag = document.getElementById('vh-active-version-tag');
  DOM.vhActiveDate = document.getElementById('vh-active-date');
  DOM.vhActiveAuthor = document.getElementById('vh-active-author');
  DOM.vhActiveReason = document.getElementById('vh-active-reason');
  DOM.vhActiveDownloadBtn = document.getElementById('vh-active-download-btn');
  DOM.vhActivePreviewBtn = document.getElementById('vh-active-preview-btn');
  DOM.vhRevisionsCount = document.getElementById('vh-revisions-count');
  DOM.vhTimelineContainer = document.getElementById('vh-timeline-container');
  DOM.btnPreviewViewHistory = document.getElementById('btn-preview-view-history');
  DOM.btnDownloadVersionHistorySample = document.getElementById('btn-download-version-history-sample');
  DOM.btnDownloadUsersSample = document.getElementById('btn-download-users-sample');
  DOM.btnDownloadAppsScript = document.getElementById('btn-download-apps-script');
  DOM.quickAccountsGrid = document.getElementById('quick-accounts-grid');

  // Toast
  DOM.toastContainer = document.getElementById('toast-container');

  // Category Pills
  DOM.categoryPillsContainer = document.getElementById('category-pills-container');
  DOM.catFavCount = document.getElementById('cat-fav-count');

  // Mobile Bottom Navigation
  DOM.mobileBottomNav = document.getElementById('mobile-bottom-nav');
  DOM.mobileNavHome = document.getElementById('mobile-nav-home');
  DOM.mobileNavSearch = document.getElementById('mobile-nav-search');
  DOM.mobileNavFavorites = document.getElementById('mobile-nav-favorites');
  DOM.mobileFavBadge = document.getElementById('mobile-fav-badge');
  DOM.mobileNavSync = document.getElementById('mobile-nav-sync');
  DOM.mobileNavSettings = document.getElementById('mobile-nav-settings');
  DOM.mobileNavUser = document.getElementById('mobile-nav-user');
}

/**
 * Initialize Lucide Icons
 */
function initLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Initialize Theme (Light / Dark)
 */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  applyTheme(savedTheme);

  DOM.btnToggleTheme.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (DOM.themeIcon) {
    DOM.themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    initLucideIcons();
  }
}

/**
 * Bind DOM Event Listeners
 */
function bindEventListeners() {
  // Global search input
  DOM.globalSearchInput.addEventListener('input', (e) => {
    AppState.searchQuery = e.target.value.trim();
    if (AppState.searchQuery.length > 0) {
      DOM.btnClearSearch.classList.remove('hidden');
    } else {
      DOM.btnClearSearch.classList.add('hidden');
    }
    applyFiltersAndRender();
  });

  DOM.btnClearSearch.addEventListener('click', () => {
    DOM.globalSearchInput.value = '';
    AppState.searchQuery = '';
    DOM.btnClearSearch.classList.add('hidden');
    DOM.globalSearchInput.focus();
    applyFiltersAndRender();
  });

  // Hotkey '/' to focus search
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== DOM.globalSearchInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      DOM.globalSearchInput.focus();
    }
  });

  // Quick tag chips in hero
  document.querySelectorAll('.quick-tag-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const tagText = btn.getAttribute('data-search');
      DOM.globalSearchInput.value = tagText;
      AppState.searchQuery = tagText;
      DOM.btnClearSearch.classList.remove('hidden');
      applyFiltersAndRender();
      DOM.globalSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Filter Dropdowns
  DOM.filterDept.addEventListener('change', (e) => {
    AppState.selectedDepartment = e.target.value;
    applyFiltersAndRender();
  });

  DOM.filterType.addEventListener('change', (e) => {
    AppState.selectedCategory = e.target.value;
    applyFiltersAndRender();
  });

  // Favorite Filter Toggle
  DOM.btnToggleFavoriteFilter.addEventListener('click', () => {
    AppState.onlyFavorites = !AppState.onlyFavorites;
    DOM.btnToggleFavoriteFilter.classList.toggle('active', AppState.onlyFavorites);
    applyFiltersAndRender();
  });

  // Reset Filters Button
  DOM.btnResetFilters.addEventListener('click', resetAllFilters);
  DOM.btnEmptyReset.addEventListener('click', resetAllFilters);

  // Sorting
  DOM.sortBy.addEventListener('change', (e) => {
    AppState.sortBy = e.target.value;
    applyFiltersAndRender();
  });

  // View Mode toggling
  DOM.btnViewGrid.addEventListener('click', () => setViewMode('grid'));
  DOM.btnViewTable.addEventListener('click', () => setViewMode('table'));

  // Group By Selector
  if (DOM.selectGroupBy) {
    DOM.selectGroupBy.addEventListener('change', (e) => {
      AppState.groupBy = e.target.value;
      renderTableRows(AppState.filteredDocuments);
      initLucideIcons();
    });
  }

  // Export Excel / CSV
  if (DOM.btnExportExcel) {
    DOM.btnExportExcel.addEventListener('click', exportFilteredDocumentsToExcel);
  }

  // Toggle All Groups
  if (DOM.btnToggleAllGroups) {
    DOM.btnToggleAllGroups.addEventListener('click', toggleAllTableGroups);
  }

  // Metrics Bar Clicks
  DOM.cardFilterAll.addEventListener('click', resetAllFilters);
  DOM.cardFilterProcesses.addEventListener('click', () => {
    AppState.selectedCategory = 'Quy trình';
    DOM.filterType.value = 'Quy trình';
    applyFiltersAndRender();
  });
  DOM.cardFilterStandards.addEventListener('click', () => {
    AppState.selectedCategory = 'Tiêu chuẩn';
    DOM.filterType.value = 'Tiêu chuẩn';
    applyFiltersAndRender();
  });
  DOM.cardFilterInstructions.addEventListener('click', () => {
    AppState.selectedCategory = 'Hướng dẫn';
    DOM.filterType.value = 'Hướng dẫn';
    applyFiltersAndRender();
  });

  // Header Sync Button
  DOM.btnSyncData.addEventListener('click', () => {
    syncFromConfiguredSheet(true);
  });

  // User Profile & Login Modal Events
  if (DOM.btnOpenLogin) {
    DOM.btnOpenLogin.addEventListener('click', openLoginModal);
  }
  if (DOM.btnCloseLogin) {
    DOM.btnCloseLogin.addEventListener('click', closeLoginModal);
  }
  if (DOM.modalLogin) {
    DOM.modalLogin.addEventListener('click', (e) => {
      if (e.target === DOM.modalLogin) closeLoginModal();
    });
  }
  if (DOM.btnTogglePasswordVisibility) {
    DOM.btnTogglePasswordVisibility.addEventListener('click', togglePasswordVisibility);
  }

  // Quick account switcher chips
  document.querySelectorAll('.quick-user-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const uName = chip.getAttribute('data-username');
      const uPass = chip.getAttribute('data-password');
      if (DOM.inputLoginUsername) DOM.inputLoginUsername.value = uName;
      if (DOM.inputLoginPassword) DOM.inputLoginPassword.value = uPass;
      handleLoginSubmit();
    });
  });

  // Login form submission
  if (DOM.formLogin) {
    DOM.formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLoginSubmit();
    });
  }
  if (DOM.btnSubmitLogin) {
    DOM.btnSubmitLogin.addEventListener('click', (e) => {
      e.preventDefault();
      handleLoginSubmit();
    });
  }
  if (DOM.btnLogout) {
    DOM.btnLogout.addEventListener('click', handleLogout);
  }

  // Settings Modal Events
  if (DOM.btnOpenSettings) DOM.btnOpenSettings.addEventListener('click', openSettingsModal);
  if (DOM.btnFooterGuide) DOM.btnFooterGuide.addEventListener('click', openSettingsModal);
  if (DOM.btnCloseSettings) DOM.btnCloseSettings.addEventListener('click', closeSettingsModal);
  if (DOM.btnCancelSettings) DOM.btnCancelSettings.addEventListener('click', closeSettingsModal);

  // Click outside modal to close
  if (DOM.modalSettings) {
    DOM.modalSettings.addEventListener('click', (e) => {
      if (e.target === DOM.modalSettings) closeSettingsModal();
    });
  }

  // Copy Sheet & AI URLs
  const btnCopySheetUrl = document.getElementById('btn-copy-sheet-url');
  if (btnCopySheetUrl) {
    btnCopySheetUrl.addEventListener('click', () => {
      const currentConfig = DataStore.getSheetConfig();
      const rawSheetUrl = (currentConfig && (currentConfig.rawInput || currentConfig.sheetId)) || DEFAULT_SHEET_CONFIG.sheetId;
      navigator.clipboard.writeText(rawSheetUrl).then(() => {
        showToast('Đã sao chép link nguồn Google Sheets vào bộ nhớ tạm!', 'success');
      }).catch(() => {
        showToast('Không thể sao chép link tự động.', 'error');
      });
    });
  }

  const btnCopyAiUrl = document.getElementById('btn-copy-ai-url');
  if (btnCopyAiUrl) {
    btnCopyAiUrl.addEventListener('click', () => {
      const aiUrl = DataStore.getAiAssistantUrl();
      navigator.clipboard.writeText(aiUrl).then(() => {
        showToast('Đã sao chép link Trợ lý AI NotebookLM vào bộ nhớ tạm!', 'success');
      }).catch(() => {
        showToast('Không thể sao chép link tự động.', 'error');
      });
    });
  }

  // Toggle Edit Sheet Section
  const btnToggleSheetEdit = document.getElementById('btn-toggle-sheet-edit');
  const boxEditSheet = document.getElementById('box-edit-sheet');
  if (btnToggleSheetEdit && boxEditSheet) {
    btnToggleSheetEdit.addEventListener('click', () => {
      boxEditSheet.classList.toggle('hidden');
      initLucideIcons();
    });
  }

  const btnCancelSheetEdit = document.getElementById('btn-cancel-sheet-edit');
  if (btnCancelSheetEdit && boxEditSheet) {
    btnCancelSheetEdit.addEventListener('click', () => {
      boxEditSheet.classList.add('hidden');
    });
  }

  // Toggle Edit AI Section
  const btnToggleAiEdit = document.getElementById('btn-toggle-ai-edit');
  const boxEditAi = document.getElementById('box-edit-ai');
  const inputAiUrl = document.getElementById('input-ai-url');
  const btnSaveAiUrl = document.getElementById('btn-save-ai-url');
  const aiConnectionStatus = document.getElementById('ai-connection-status');

  if (btnToggleAiEdit && boxEditAi) {
    btnToggleAiEdit.addEventListener('click', () => {
      boxEditAi.classList.toggle('hidden');
      if (!boxEditAi.classList.contains('hidden') && inputAiUrl) {
        inputAiUrl.value = DataStore.getAiAssistantUrl();
        inputAiUrl.focus();
      }
      initLucideIcons();
    });
  }

  if (btnSaveAiUrl && inputAiUrl) {
    btnSaveAiUrl.addEventListener('click', async () => {
      const newUrl = inputAiUrl.value.trim();
      if (!newUrl || !newUrl.startsWith('http')) {
        showToast('Vui lòng nhập đường link hợp lệ (bắt đầu bằng https://)', 'warning');
        return;
      }

      btnSaveAiUrl.disabled = true;
      btnSaveAiUrl.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Đang lưu...';
      if (aiConnectionStatus) {
        aiConnectionStatus.className = 'connection-status-msg info';
        aiConnectionStatus.textContent = 'Đang đồng bộ link AI lên Google Sheet...';
        aiConnectionStatus.classList.remove('hidden');
      }

      // 1. Lưu cục bộ ngay
      DataStore.setAiAssistantUrl(newUrl);

      // 2. Cập nhật giao diện hiển thị ngay lập tức
      const viewAiUrl = document.getElementById('view-ai-url');
      if (viewAiUrl) viewAiUrl.textContent = newUrl;
      const linkOpenAi = document.getElementById('link-open-ai');
      if (linkOpenAi) linkOpenAi.href = newUrl;

      // 3. Đồng bộ lên Google Sheet (Web App)
      try {
        const syncResult = await DataStore.syncAiUrlToGoogleSheet(newUrl);
        if (syncResult && syncResult.synced) {
          showToast('Đã lưu & đồng bộ thành công link Trợ lý AI lên Google Sheet!', 'success');
          if (aiConnectionStatus) {
            aiConnectionStatus.className = 'connection-status-msg success';
            aiConnectionStatus.textContent = 'Đã lưu và đồng bộ link AI lên Google Sheet thành công!';
          }
          setTimeout(() => {
            if (boxEditAi) boxEditAi.classList.add('hidden');
          }, 1500);
        } else {
          showToast(syncResult.message || 'Đã lưu link AI vào trình duyệt thành công!', 'success');
          if (aiConnectionStatus) {
            aiConnectionStatus.className = 'connection-status-msg warning';
            aiConnectionStatus.textContent = syncResult.message || 'Đã lưu trên máy!';
          }
        }
      } catch (err) {
        showToast('Đã lưu trên trình duyệt! (' + err.message + ')', 'info');
      } finally {
        btnSaveAiUrl.disabled = false;
        btnSaveAiUrl.innerHTML = '<i data-lucide="save"></i> Lưu & Đồng bộ';
        initLucideIcons();
      }
    });
  }

  if (DOM.btnTestSheet) DOM.btnTestSheet.addEventListener('click', testSheetConnection);
  if (DOM.btnSaveSettings) DOM.btnSaveSettings.addEventListener('click', saveAndSyncSheet);

  if (DOM.btnDownloadCsvSample) DOM.btnDownloadCsvSample.addEventListener('click', downloadCsvSample);
  if (DOM.btnFooterTemplate) DOM.btnFooterTemplate.addEventListener('click', downloadCsvSample);

  if (DOM.btnUseMockData) {
    DOM.btnUseMockData.addEventListener('click', () => {
      DataStore.clearCustomDocuments();
      AppState.allDocuments = DEFAULT_MOCK_DOCUMENTS;
      updateDataStatusBadge(true, 'Dữ liệu mẫu nội bộ');
      populateDepartmentOptions();
      applyFiltersAndRender();
      closeSettingsModal();
      showToast('Đã chuyển về sử dụng bộ dữ liệu mẫu', 'info');
    });
  }

  // Preview Modal Events
  DOM.btnClosePreview.addEventListener('click', closePreviewModal);
  DOM.modalPreview.addEventListener('click', (e) => {
    if (e.target === DOM.modalPreview) closePreviewModal();
  });

  DOM.btnCopyLink.addEventListener('click', copyPreviewDocLink);
  DOM.btnPreviewFav.addEventListener('click', togglePreviewDocFav);

  // Version History Modal Events
  if (DOM.btnCloseVersionHistory) {
    DOM.btnCloseVersionHistory.addEventListener('click', closeVersionHistoryModal);
  }
  if (DOM.modalVersionHistory) {
    DOM.modalVersionHistory.addEventListener('click', (e) => {
      if (e.target === DOM.modalVersionHistory) closeVersionHistoryModal();
    });
  }
  if (DOM.btnPreviewViewHistory) {
    DOM.btnPreviewViewHistory.addEventListener('click', () => {
      if (AppState.activePreviewDoc) {
        closePreviewModal();
        openVersionHistoryModal(AppState.activePreviewDoc.code);
      }
    });
  }
  if (DOM.btnDownloadVersionHistorySample) {
    DOM.btnDownloadVersionHistorySample.addEventListener('click', downloadVersionHistorySampleCsv);
  }
  if (DOM.btnDownloadUsersSample) {
    DOM.btnDownloadUsersSample.addEventListener('click', downloadUsersSampleCsv);
  }
  if (DOM.btnDownloadAppsScript) {
    DOM.btnDownloadAppsScript.addEventListener('click', downloadAppsScriptFile);
  }

  // Add Document Modal Events
  if (DOM.btnOpenAddDoc) {
    DOM.btnOpenAddDoc.addEventListener('click', openAddDocModal);
  }
  if (DOM.btnToolbarAddDoc) {
    DOM.btnToolbarAddDoc.addEventListener('click', openAddDocModal);
  }
  if (DOM.btnCloseAddDoc) {
    DOM.btnCloseAddDoc.addEventListener('click', closeAddDocModal);
  }
  if (DOM.btnCancelAddDoc) {
    DOM.btnCancelAddDoc.addEventListener('click', closeAddDocModal);
  }
  if (DOM.modalAddDoc) {
    DOM.modalAddDoc.addEventListener('click', (e) => {
      // KHÔNG tự đóng modal khi bấm ra ngoài nền mờ
      // Chỉ khi người dùng bấm trực tiếp nút X (hoặc nút Hủy bỏ) thì modal mới đóng
      if (e.target === DOM.modalAddDoc) {
        const win = DOM.modalAddDoc.querySelector('.modal-add-doc-window');
        if (win) {
          win.classList.remove('static-bounce');
          void win.offsetWidth; // Trigger reflow để animation kích hoạt lại
          win.classList.add('static-bounce');
        }
      }
    });
  }
  if (DOM.btnSuggestCode) {
    DOM.btnSuggestCode.addEventListener('click', () => suggestNextDocCode(true));
  }
  if (DOM.addDocDept) {
    DOM.addDocDept.addEventListener('change', () => suggestNextDocCode(false));
  }
  if (DOM.addDocCat) {
    DOM.addDocCat.addEventListener('change', () => suggestNextDocCode(false));
  }
  if (DOM.formAddDoc) {
    DOM.formAddDoc.addEventListener('submit', handleAddDocSubmit);
  }
  if (DOM.btnAddDocMoreLink) {
    DOM.btnAddDocMoreLink.addEventListener('click', () => {
      addLinkRowToBuilder(DOM.addDocLinksContainer);
    });
  }

  // Edit Document Modal Events
  if (DOM.btnCloseEditDoc) {
    DOM.btnCloseEditDoc.addEventListener('click', closeEditDocModal);
  }
  if (DOM.btnCancelEditDoc) {
    DOM.btnCancelEditDoc.addEventListener('click', closeEditDocModal);
  }
  if (DOM.modalEditDoc) {
    DOM.modalEditDoc.addEventListener('click', (e) => {
      if (e.target === DOM.modalEditDoc) {
        const win = DOM.modalEditDoc.querySelector('.modal-add-doc-window');
        if (win) {
          win.classList.remove('static-bounce');
          void win.offsetWidth;
          win.classList.add('static-bounce');
        }
      }
    });
  }
  if (DOM.btnEditDocMoreLink) {
    DOM.btnEditDocMoreLink.addEventListener('click', () => {
      addLinkRowToBuilder(DOM.editDocLinksContainer);
    });
  }
  if (DOM.formEditDoc) {
    DOM.formEditDoc.addEventListener('submit', handleEditDocSubmit);
  }

  // Delete Document Confirmation Modal Events
  if (DOM.btnCloseDeleteModal) {
    DOM.btnCloseDeleteModal.addEventListener('click', closeDeleteConfirmModal);
  }
  if (DOM.btnCancelDelete) {
    DOM.btnCancelDelete.addEventListener('click', closeDeleteConfirmModal);
  }
  if (DOM.modalDeleteConfirm) {
    DOM.modalDeleteConfirm.addEventListener('click', (e) => {
      if (e.target === DOM.modalDeleteConfirm) {
        closeDeleteConfirmModal();
      }
    });
  }
  if (DOM.btnConfirmDelete) {
    DOM.btnConfirmDelete.addEventListener('click', handleExecuteDelete);
  }
  if (DOM.btnPreviewDelete) {
    DOM.btnPreviewDelete.addEventListener('click', () => {
      if (AppState.activePreviewDoc) {
        openDeleteConfirmModal(AppState.activePreviewDoc);
      }
    });
  }

  // Category Pills (Horizontal touch bar)
  if (DOM.categoryPillsContainer) {
    DOM.categoryPillsContainer.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        if (cat === 'favorite') {
          AppState.onlyFavorites = !AppState.onlyFavorites;
          DOM.btnToggleFavoriteFilter.classList.toggle('active', AppState.onlyFavorites);
        } else {
          AppState.onlyFavorites = false;
          DOM.btnToggleFavoriteFilter.classList.remove('active');
          AppState.selectedCategory = cat;
          DOM.filterType.value = cat;
        }
        applyFiltersAndRender();
      });
    });
  }

  // Mobile Bottom Navigation Bar Events
  if (DOM.mobileNavHome) {
    DOM.mobileNavHome.addEventListener('click', () => {
      resetAllFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveMobileNav('home');
    });
  }

  if (DOM.mobileNavSearch) {
    DOM.mobileNavSearch.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        DOM.globalSearchInput.focus();
      }, 300);
      setActiveMobileNav('search');
    });
  }

  if (DOM.mobileNavFavorites) {
    DOM.mobileNavFavorites.addEventListener('click', () => {
      AppState.onlyFavorites = !AppState.onlyFavorites;
      DOM.btnToggleFavoriteFilter.classList.toggle('active', AppState.onlyFavorites);
      applyFiltersAndRender();
      setActiveMobileNav(AppState.onlyFavorites ? 'favorites' : 'home');
    });
  }

  if (DOM.mobileNavSync) {
    DOM.mobileNavSync.addEventListener('click', () => {
      syncFromConfiguredSheet(true);
      setActiveMobileNav('sync');
    });
  }

  if (DOM.mobileNavSettings) {
    DOM.mobileNavSettings.addEventListener('click', () => {
      openSettingsModal();
      setActiveMobileNav('settings');
    });
  }

  if (DOM.mobileNavUser) {
    DOM.mobileNavUser.addEventListener('click', () => {
      openLoginModal();
      setActiveMobileNav('user');
    });
  }

  // Dedicated Floating Gear Settings Button
  const btnFloatingSettings = document.getElementById('btn-floating-settings');
  if (btnFloatingSettings) {
    btnFloatingSettings.addEventListener('click', openSettingsModal);
  }

  // Floating AI Assistant (NotebookLM) Button - STRICTLY FOR AI ONLY
  const btnOpenAiAssistant = document.getElementById('btn-open-ai-assistant');
  if (btnOpenAiAssistant) {
    btnOpenAiAssistant.addEventListener('click', openAiAssistant);
  }
}

/**
 * Open NotebookLM AI Assistant (Strictly opens AI in a new tab)
 */
function openAiAssistant() {
  const targetUrl = DataStore.getAiAssistantUrl();
  window.open(targetUrl, '_blank');
  showToast('Đang mở sổ tay Trợ lý AI NotebookLM H-Design...', 'info');
}

/**
 * Set Active Item in Mobile Bottom Navigation Bar
 */
function setActiveMobileNav(activeKey) {
  if (!DOM.mobileBottomNav) return;
  DOM.mobileBottomNav.querySelectorAll('.mobile-nav-item').forEach(item => item.classList.remove('active'));
  if (activeKey === 'home' && DOM.mobileNavHome) DOM.mobileNavHome.classList.add('active');
  if (activeKey === 'search' && DOM.mobileNavSearch) DOM.mobileNavSearch.classList.add('active');
  if (activeKey === 'user' && DOM.mobileNavUser) DOM.mobileNavUser.classList.add('active');
  if (activeKey === 'favorites' && DOM.mobileNavFavorites) DOM.mobileNavFavorites.classList.add('active');
  if (activeKey === 'sync' && DOM.mobileNavSync) DOM.mobileNavSync.classList.add('active');
  if (activeKey === 'settings' && DOM.mobileNavSettings) DOM.mobileNavSettings.classList.add('active');
}

/**
 * Get documents accessible by currently logged in user based on department permissions
 */
function getAccessibleDocuments() {
  return AuthStore.filterAllowedDocuments(AppState.allDocuments, AppState.currentUser);
}

/**
 * Load Initial Data
 */
async function loadInitialData() {
  AppState.currentUser = AuthStore.getCurrentUser();
  updateAuthUI();

  // If not logged in yet, pop up the login modal immediately!
  if (!AppState.currentUser) {
    openLoginModal(true);
  }

  const sheetConfig = DataStore.getSheetConfig();
  if (sheetConfig && sheetConfig.sheetId) {
    try {
      updateDataStatusBadge(false, 'Đang đồng bộ Google Sheets...');
      const docs = await fetchGoogleSheetData(sheetConfig.sheetId, sheetConfig.tabName);
      if (docs && docs.length > 0) {
        AppState.allDocuments = docs;
        DataStore.setDocuments(docs);
        updateDataStatusBadge(true, 'Đã đồng bộ Google Sheets');
        showToast(`Đã đồng bộ thành công ${docs.length} tài liệu từ Google Sheets!`, 'success');
      } else {
        AppState.allDocuments = DataStore.getDocuments();
        updateDataStatusBadge(false, 'Chưa đồng bộ Google Sheets');
      }
    } catch (err) {
      console.warn('Không thể đồng bộ Google Sheet ngay lúc này, dùng cache:', err);
      AppState.allDocuments = DataStore.getDocuments();
      updateDataStatusBadge(false, 'Chưa đồng bộ Google Sheets');
      showToast('Đang tải dữ liệu từ bộ nhớ tạm.', 'warning');
    }
  } else {
    // Use cached or mock data
    AppState.allDocuments = DataStore.getDocuments();
    updateDataStatusBadge(false, 'Chưa đồng bộ Google Sheets');
  }

  // Ensure sample doc-1 has multiple links for testing if not yet updated
  const doc1 = AppState.allDocuments.find(d => d.id === 'doc-1' || d.code === 'QT-TK-01');
  if (doc1 && !doc1.driveUrl.includes('\n')) {
    doc1.driveUrl = "Tài liệu Quy trình chính (PDF): https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing\nBiểu mẫu khảo sát hiện trạng BM-01 (Excel): https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing\nChecklist kiểm tra hồ sơ thiết kế: https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing";
  }

  // Migrate any cached 'Bộ phận Thiết Kế' to 'Bộ phận Kỹ Thuật'
  let hasDeptChanged = false;
  AppState.allDocuments.forEach(d => {
    if (d.department === 'Bộ phận Thiết Kế') {
      d.department = 'Bộ phận Kỹ Thuật';
      hasDeptChanged = true;
    }
  });
  if (AppState.currentUser) {
    if (Array.isArray(AppState.currentUser.allowedDepartments)) {
      AppState.currentUser.allowedDepartments = AppState.currentUser.allowedDepartments.map(dept => 
        dept === 'Bộ phận Thiết Kế' ? 'Bộ phận Kỹ Thuật' : dept
      );
    }
    if (AppState.currentUser.department === 'Bộ phận Thiết Kế' || AppState.currentUser.username === 'thietke') {
      AppState.currentUser.department = 'Bộ phận Kỹ Thuật';
      AppState.currentUser.fullName = 'Kỹ Sư Hoàng (Kỹ Thuật)';
    }
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(AppState.currentUser));
    updateAuthUI();
  }
  if (hasDeptChanged) {
    DataStore.setDocuments(AppState.allDocuments);
  }

  populateDepartmentOptions();
  updateFavoritesCounter();
  applyFiltersAndRender();
}

/**
 * Update Data Status in Top Navigation Bar
 */
function updateDataStatusBadge(isOnline, text) {
  const statusText = document.getElementById('data-status-text') || DOM.dataStatusText;
  const syncBtn = document.getElementById('btn-sync-data') || DOM.btnSyncData;

  if (statusText && text) {
    statusText.textContent = text;
  }

  const isSyncing = text && text.includes('Đang đồng bộ');
  const isSynced = Boolean(isOnline) && Boolean(text) && !isSyncing && (
    text.includes('Đã đồng bộ') ||
    text.includes('Google Sheets') ||
    text.includes('thành công')
  );

  if (syncBtn) {
    syncBtn.classList.remove('is-synced', 'not-synced', 'is-syncing');

    if (isSyncing) {
      syncBtn.classList.add('not-synced', 'is-syncing');
      syncBtn.setAttribute('title', 'Đang đồng bộ dữ liệu từ Google Sheets...');
    } else if (isSynced) {
      syncBtn.classList.add('is-synced');
      syncBtn.setAttribute('title', 'Đã đồng bộ Google Sheets (Bấm để làm mới dữ liệu)');
    } else {
      syncBtn.classList.add('not-synced');
      syncBtn.setAttribute('title', 'Chưa đồng bộ Google Sheets (Bấm để thử kết nối lại)');
    }
  }
}

/**
 * Populate department filter options and pill tabs (Scoped to allowed departments)
 */
function populateDepartmentOptions() {
  const accessibleDocs = getAccessibleDocuments();
  const deptsSet = new Set();
  accessibleDocs.forEach(doc => {
    if (doc.department) deptsSet.add(doc.department.trim());
  });

  const depts = Array.from(deptsSet).sort();

  // Populate Select Dropdown
  const currentVal = DOM.filterDept.value;
  DOM.filterDept.innerHTML = '<option value="all">Tất cả phòng ban</option>';
  depts.forEach(dept => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = dept;
    DOM.filterDept.appendChild(opt);
  });
  
  if (depts.includes(currentVal)) {
    DOM.filterDept.value = currentVal;
  } else {
    DOM.filterDept.value = 'all';
    AppState.selectedDepartment = 'all';
  }

  // Populate Pill Tabs
  DOM.deptPillsContainer.innerHTML = '';
  
  // "All" Pill
  const allPill = document.createElement('button');
  allPill.className = `dept-pill ${AppState.selectedDepartment === 'all' ? 'active' : ''}`;
  allPill.innerHTML = `<span>Tất cả</span> <span class="count">${accessibleDocs.length}</span>`;
  allPill.addEventListener('click', () => {
    AppState.selectedDepartment = 'all';
    DOM.filterDept.value = 'all';
    applyFiltersAndRender();
  });
  DOM.deptPillsContainer.appendChild(allPill);

  // Each department pill
  depts.forEach(dept => {
    const count = accessibleDocs.filter(d => d.department === dept).length;
    const pill = document.createElement('button');
    pill.className = `dept-pill ${AppState.selectedDepartment === dept ? 'active' : ''}`;
    pill.innerHTML = `<span>${dept}</span> <span class="count">${count}</span>`;
    pill.addEventListener('click', () => {
      AppState.selectedDepartment = dept;
      DOM.filterDept.value = dept;
      applyFiltersAndRender();
    });
    DOM.deptPillsContainer.appendChild(pill);
  });
}

/**
 * Set View Mode (Grid vs Table)
 */
function setViewMode(mode) {
  AppState.viewMode = mode;
  if (mode === 'grid') {
    DOM.btnViewGrid.classList.add('active');
    DOM.btnViewTable.classList.remove('active');
    DOM.documentsGrid.classList.remove('hidden');
    DOM.documentsTableWrapper.classList.add('hidden');
  } else {
    DOM.btnViewTable.classList.add('active');
    DOM.btnViewGrid.classList.remove('active');
    DOM.documentsTableWrapper.classList.remove('hidden');
    DOM.documentsGrid.classList.add('hidden');
  }
}

/**
 * Reset all active filters
 */
function resetAllFilters() {
  AppState.searchQuery = '';
  AppState.selectedDepartment = 'all';
  AppState.selectedCategory = 'all';
  AppState.onlyFavorites = false;
  AppState.groupBy = 'none';
  if (DOM.selectGroupBy) DOM.selectGroupBy.value = 'none';

  DOM.globalSearchInput.value = '';
  DOM.btnClearSearch.classList.add('hidden');
  DOM.filterDept.value = 'all';
  DOM.filterType.value = 'all';
  DOM.btnToggleFavoriteFilter.classList.remove('active');

  applyFiltersAndRender();
  showToast('Đã đặt lại tất cả bộ lọc', 'info');
}

/**
 * Filter & Search Pipeline (Respects user department permissions)
 */
function applyFiltersAndRender() {
  const accessibleDocs = getAccessibleDocuments();
  const query = normalizeSearchString(AppState.searchQuery);
  const selectedDept = AppState.selectedDepartment;
  const selectedCat = AppState.selectedCategory;
  const onlyFav = AppState.onlyFavorites;

  let results = accessibleDocs.filter(doc => {
    // 1. Department match
    if (selectedDept !== 'all' && doc.department !== selectedDept) {
      return false;
    }

    // 2. Category match
    if (selectedCat !== 'all') {
      if (selectedCat === 'Tiêu chuẩn') {
        if (doc.category !== 'Tiêu chuẩn' && doc.category !== 'Quy chuẩn') return false;
      } else if (doc.category !== selectedCat) {
        return false;
      }
    }

    // 3. Favorites only
    if (onlyFav && !DataStore.isFavorite(doc.id)) {
      return false;
    }

    // 4. Text Search Match
    if (query.length > 0) {
      const codeMatch = normalizeSearchString(doc.code).includes(query);
      const titleMatch = normalizeSearchString(doc.title).includes(query);
      const descMatch = normalizeSearchString(doc.description).includes(query);
      const deptMatch = normalizeSearchString(doc.department).includes(query);
      const tagsMatch = doc.tags && doc.tags.some(t => normalizeSearchString(t).includes(query));

      if (!codeMatch && !titleMatch && !descMatch && !deptMatch && !tagsMatch) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  results.sort((a, b) => {
    if (AppState.sortBy === 'updated-desc') {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    } else if (AppState.sortBy === 'title-asc') {
      return a.title.localeCompare(b.title, 'vi');
    } else if (AppState.sortBy === 'code-asc') {
      return a.code.localeCompare(b.code, 'vi');
    } else if (AppState.sortBy === 'dept-asc') {
      return a.department.localeCompare(b.department, 'vi');
    }
    return 0;
  });

  AppState.filteredDocuments = results;

  // Render
  renderMetrics();
  renderKpiCarousel();
  renderActiveFilterChips();
  renderPillsActiveState();
  renderDocumentsDisplay();
  updateFavoritesCounter();
}

/**
 * Render Metrics Bar Stats (Scoped to accessible documents)
 */
function renderMetrics() {
  const accessibleDocs = getAccessibleDocuments();
  DOM.statTotalDocs.textContent = accessibleDocs.length;

  const depts = new Set(accessibleDocs.map(d => d.department)).size;
  DOM.statTotalDepts.textContent = depts;

  const processes = accessibleDocs.filter(d => d.category === 'Quy trình').length;
  DOM.statTotalProcesses.textContent = processes;

  const standards = accessibleDocs.filter(d => d.category === 'Tiêu chuẩn' || d.category === 'Quy chuẩn').length;
  DOM.statTotalStandards.textContent = standards;

  const instructions = accessibleDocs.filter(d => d.category === 'Hướng dẫn' || d.category === 'Biểu mẫu').length;
  DOM.statTotalInstructions.textContent = instructions;

  // Current counter
  DOM.currentCount.textContent = AppState.filteredDocuments.length;
  DOM.totalCount.textContent = accessibleDocs.length;
}

/**
 * Render Dynamic KPI Stats Carousel (Scoped to accessible departments)
 */
function renderKpiCarousel() {
  if (!DOM.kpiStatsContainer) return;

  const accessibleDocs = getAccessibleDocuments();
  const currentDept = AppState.selectedDepartment;

  // Compute departments from accessible documents
  const depts = Array.from(new Set(accessibleDocs.map(d => d.department))).sort();

  // "Tất cả" chip
  let html = `
    <button class="kpi-chip ${currentDept === 'all' ? 'active' : ''}" data-dept="all" title="Xem tất cả tài liệu được cấp phép">
      <i data-lucide="layers" style="width: 14px; height: 14px;"></i>
      <span>Tất cả phòng ban</span>
      <span class="kpi-chip-count">${accessibleDocs.length}</span>
    </button>
  `;

  // Each department chip
  depts.forEach(dept => {
    const deptMeta = DEPARTMENT_COLORS[dept] || { icon: 'building', text: 'var(--primary)' };
    const count = accessibleDocs.filter(d => d.department === dept).length;
    const isActive = currentDept === dept;

    html += `
      <button class="kpi-chip ${isActive ? 'active' : ''}" data-dept="${escapeHtml(dept)}" title="Lọc theo ${escapeHtml(dept)}">
        <i data-lucide="${deptMeta.icon || 'building'}" style="width: 14px; height: 14px;"></i>
        <span>${escapeHtml(dept)}</span>
        <span class="kpi-chip-count">${count}</span>
      </button>
    `;
  });

  DOM.kpiStatsContainer.innerHTML = html;

  // Add click listeners to KPI chips
  DOM.kpiStatsContainer.querySelectorAll('.kpi-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const targetDept = chip.getAttribute('data-dept');
      if (AppState.selectedDepartment === targetDept && targetDept !== 'all') {
        AppState.selectedDepartment = 'all';
        DOM.filterDept.value = 'all';
      } else {
        AppState.selectedDepartment = targetDept;
        DOM.filterDept.value = targetDept;
      }
      applyFiltersAndRender();
    });
  });

  initLucideIcons();
}

/**
 * Render Pill Tab active styling
 */
function renderPillsActiveState() {
  // Department Pills
  document.querySelectorAll('.dept-pill').forEach(pill => {
    const text = pill.querySelector('span')?.textContent || '';
    if (AppState.selectedDepartment === 'all' && text === 'Tất cả') {
      pill.classList.add('active');
    } else if (text === AppState.selectedDepartment) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Category Pills
  if (DOM.categoryPillsContainer) {
    DOM.categoryPillsContainer.querySelectorAll('.cat-pill').forEach(pill => {
      const cat = pill.getAttribute('data-category');
      if (cat === 'favorite') {
        pill.classList.toggle('active', AppState.onlyFavorites);
      } else if (!AppState.onlyFavorites && AppState.selectedCategory === cat) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Mobile Bottom Navigation Bar synchronization
  if (AppState.onlyFavorites) {
    setActiveMobileNav('favorites');
  } else if (AppState.searchQuery) {
    setActiveMobileNav('search');
  } else {
    setActiveMobileNav('home');
  }
}

/**
 * Render Active Filter Chips
 */
function renderActiveFilterChips() {
  DOM.activeFilterChips.innerHTML = '';

  if (AppState.searchQuery) {
    addFilterChip(`Tìm kiếm: "${AppState.searchQuery}"`, () => {
      DOM.globalSearchInput.value = '';
      AppState.searchQuery = '';
      DOM.btnClearSearch.classList.add('hidden');
      applyFiltersAndRender();
    });
  }

  if (AppState.selectedDepartment !== 'all') {
    addFilterChip(`Phòng: ${AppState.selectedDepartment}`, () => {
      AppState.selectedDepartment = 'all';
      DOM.filterDept.value = 'all';
      applyFiltersAndRender();
    });
  }

  if (AppState.selectedCategory !== 'all') {
    addFilterChip(`Loại: ${AppState.selectedCategory}`, () => {
      AppState.selectedCategory = 'all';
      DOM.filterType.value = 'all';
      applyFiltersAndRender();
    });
  }

  if (AppState.onlyFavorites) {
    addFilterChip('Chỉ mục yêu thích', () => {
      AppState.onlyFavorites = false;
      DOM.btnToggleFavoriteFilter.classList.remove('active');
      applyFiltersAndRender();
    });
  }
}

function addFilterChip(text, onRemove) {
  const chip = document.createElement('div');
  chip.className = 'active-chip';
  chip.innerHTML = `
    <span>${escapeHtml(text)}</span>
    <span class="active-chip-remove" title="Xóa bộ lọc này">&times;</span>
  `;
  chip.querySelector('.active-chip-remove').addEventListener('click', onRemove);
  DOM.activeFilterChips.appendChild(chip);
}

/**
 * Render Documents (Grid & Table)
 */
function renderDocumentsDisplay() {
  const docs = AppState.filteredDocuments;

  if (docs.length === 0) {
    DOM.emptyState.classList.remove('hidden');
    DOM.documentsGrid.classList.add('hidden');
    DOM.documentsTableWrapper.classList.add('hidden');

    const emptyTitle = DOM.emptyState.querySelector('.empty-title');
    const emptyText = DOM.emptyState.querySelector('.empty-text');
    const resetBtn = DOM.emptyState.querySelector('#btn-empty-reset');

    if (!AppState.currentUser) {
      if (emptyTitle) emptyTitle.textContent = 'Chưa đăng nhập hệ thống';
      if (emptyText) emptyText.textContent = 'Vui lòng đăng nhập với tài khoản và mật khẩu được cấp để tra cứu các quy trình, hướng dẫn của phòng ban.';
      if (resetBtn) {
        resetBtn.innerHTML = '<i data-lucide="log-in"></i> Đăng nhập ngay (admin / 1612)';
        resetBtn.onclick = () => openLoginModal(true);
      }
    } else {
      if (emptyTitle) emptyTitle.textContent = 'Không tìm thấy tài liệu phù hợp';
      if (emptyText) emptyText.textContent = 'Thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc phòng ban / thể loại.';
      if (resetBtn) {
        resetBtn.innerHTML = '<i data-lucide="rotate-ccw"></i> Xóa bộ lọc';
        resetBtn.onclick = resetAllFilters;
      }
    }
    initLucideIcons();
    return;
  }

  DOM.emptyState.classList.add('hidden');

  if (AppState.viewMode === 'grid') {
    DOM.documentsGrid.classList.remove('hidden');
    DOM.documentsTableWrapper.classList.add('hidden');
  } else {
    DOM.documentsGrid.classList.add('hidden');
    DOM.documentsTableWrapper.classList.remove('hidden');
  }

  // Render Grid
  renderGridCards(docs);

  // Render Table
  renderTableRows(docs);

  // Initialize icons inside rendered templates
  initLucideIcons();
}

/**
 * Render Grid Cards
 */
function renderGridCards(docs) {
  const isAdmin = AuthStore.isAdmin(AppState.currentUser);
  DOM.documentsGrid.innerHTML = docs.map(doc => {
    const isFav = DataStore.isFavorite(doc.id);
    const catClass = getCategoryClass(doc.category);
    const deptMeta = DEPARTMENT_COLORS[doc.department] || { border: '#4F46E5', text: '#4F46E5', icon: 'file-text' };
    const directDownloadUrl = getDriveDownloadUrl(doc.driveUrl);

    return `
      <div class="doc-card" data-id="${doc.id}" style="--card-accent: ${deptMeta.border}">
        <div>
          <div class="doc-card-header">
            <div class="doc-card-badges">
              <span class="doc-code-badge">${escapeHtml(doc.code)}</span>
              <span class="doc-cat-badge ${catClass}">${escapeHtml(doc.category)}</span>
            </div>
            <button class="btn-card-favorite ${isFav ? 'is-favorite' : ''}" 
                    data-id="${doc.id}" 
                    title="${isFav ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}">
              <i data-lucide="star"></i>
            </button>
          </div>

          <h3 class="doc-card-title" title="${escapeHtml(doc.title)}">${escapeHtml(doc.title)}</h3>
          <p class="doc-card-desc">${escapeHtml(doc.description || 'Chưa có mô tả tóm tắt cho quy trình này.')}</p>
        </div>

        <div>
          <div class="doc-card-meta">
            <div class="meta-dept" style="color: ${deptMeta.text}">
              <i data-lucide="${deptMeta.icon || 'building'}"></i>
              <span>${escapeHtml(doc.department)}</span>
            </div>
            <div class="meta-version-date">
              <button type="button" class="btn-version-history-chip" data-code="${escapeHtml(doc.code)}" title="Xem lịch sử thay đổi & lý do cập nhật (${escapeHtml(doc.version)})">
                <span>${escapeHtml(doc.version || 'v1.0')}</span>
                <i data-lucide="history" style="width: 11px; height: 11px;"></i>
              </button>
              <span>• ${formatDate(doc.updatedAt)}</span>
            </div>
          </div>

          <div class="doc-card-actions">
            <a href="${directDownloadUrl}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="btn-download-direct"
               title="Tải ngay file gốc từ Google Drive">
              <i data-lucide="download"></i>
              <span>Tải về</span>
            </a>
            <button class="btn-card-edit" 
                    data-id="${doc.id}" 
                    title="Sửa link Google Drive & thông tin">
              <i data-lucide="edit-3"></i>
            </button>
            ${isAdmin ? `
              <button class="btn-card-delete" 
                      data-id="${doc.id}" 
                      data-code="${escapeHtml(doc.code)}" 
                      title="Xóa tài liệu này (Chỉ Admin)">
                <i data-lucide="trash-2"></i>
              </button>
            ` : ''}
            <button class="btn-card-preview" 
                    data-id="${doc.id}" 
                    title="Xem chi tiết & xem trước tài liệu">
              <i data-lucide="eye"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach card event listeners
  DOM.documentsGrid.querySelectorAll('.btn-card-favorite').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const nowFav = DataStore.toggleFavorite(id);
      btn.classList.toggle('is-favorite', nowFav);
      updateFavoritesCounter();
      if (AppState.onlyFavorites) {
        applyFiltersAndRender();
      }
      showToast(nowFav ? 'Đã thêm vào tài liệu yêu thích' : 'Đã xóa khỏi yêu thích', 'info');
    });
  });

  DOM.documentsGrid.querySelectorAll('.btn-card-preview').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const doc = AppState.allDocuments.find(d => d.id === id);
      if (doc) openPreviewModal(doc);
    });
  });

  // Edit button on Card
  DOM.documentsGrid.querySelectorAll('.btn-card-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openEditDocModal(id);
    });
  });

  // Delete button on Card (Admin only)
  DOM.documentsGrid.querySelectorAll('.btn-card-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!AuthStore.isAdmin(AppState.currentUser)) {
        showToast('Chỉ tài khoản Quản trị (Ban Giám Đốc) mới có quyền xóa tài liệu!', 'warning');
        return;
      }
      const id = btn.getAttribute('data-id');
      const doc = AppState.allDocuments.find(d => d.id === id);
      if (doc) openDeleteConfirmModal(doc);
    });
  });

  // Version History Chip click
  DOM.documentsGrid.querySelectorAll('.btn-version-history-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = btn.getAttribute('data-code');
      openVersionHistoryModal(code);
    });
  });

  // Whole card click (tap anywhere on card to view details on mobile & desktop)
  DOM.documentsGrid.querySelectorAll('.doc-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-card-favorite') || e.target.closest('.btn-download-direct') || e.target.closest('.btn-version-history-chip') || e.target.closest('.btn-card-edit') || e.target.closest('.btn-card-delete')) {
        return;
      }
      const id = card.getAttribute('data-id');
      const doc = AppState.allDocuments.find(d => d.id === id);
      if (doc) openPreviewModal(doc);
    });
  });
}

/**
 * Render Table Rows (Supports Flat & Group By Department, Mobile & Desktop)
 */
function renderTableRows(docs) {
  if (!DOM.documentsTableBody) return;

  // Update footer statistics
  if (DOM.tableDisplayCount) DOM.tableDisplayCount.textContent = docs.length;
  if (DOM.tfootTotalCount) DOM.tfootTotalCount.textContent = docs.length;

  const distinctDepts = new Set(docs.map(d => d.department)).size;
  if (DOM.tfootDeptCount) DOM.tfootDeptCount.textContent = distinctDepts;

  // Latest update date
  if (docs.length > 0 && DOM.tfootLatestDate) {
    const sortedByDate = [...docs].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    DOM.tfootLatestDate.textContent = formatDate(sortedByDate[0].updatedAt);
  } else if (DOM.tfootLatestDate) {
    DOM.tfootLatestDate.textContent = '-';
  }

  // Handle Group By Department
  if (AppState.groupBy === 'department') {
    if (DOM.btnToggleAllGroups) DOM.btnToggleAllGroups.classList.remove('hidden');

    // Group documents by department
    const groups = {};
    docs.forEach(doc => {
      if (!groups[doc.department]) groups[doc.department] = [];
      groups[doc.department].push(doc);
    });

    const sortedDeptNames = Object.keys(groups).sort();
    let tableHtml = '';

    sortedDeptNames.forEach(deptName => {
      const deptDocs = groups[deptName];
      const deptMeta = DEPARTMENT_COLORS[deptName] || { icon: 'building', border: '#4F46E5', text: '#4F46E5' };
      const isCollapsed = AppState.collapsedGroups.has(deptName);

      // Group Header Row
      tableHtml += `
        <tr class="table-group-header-row ${isCollapsed ? 'collapsed' : ''}" data-group-name="${escapeHtml(deptName)}">
          <td colspan="8" class="table-group-cell">
            <div class="table-group-content">
              <div class="table-group-left">
                <i data-lucide="chevron-down" class="table-group-chevron"></i>
                <span class="table-group-title">
                  <i data-lucide="${deptMeta.icon || 'building'}" style="color: ${deptMeta.text}"></i>
                  ${escapeHtml(deptName)}
                </span>
                <span class="table-group-count">${deptDocs.length} tài liệu</span>
              </div>
              <span class="table-group-hint">${isCollapsed ? 'Chạm để mở rộng' : 'Chạm để thu gọn'}</span>
            </div>
          </td>
        </tr>
      `;

      // Group Children Rows
      deptDocs.forEach((doc, idx) => {
        tableHtml += generateTableRowHtml(doc, idx, isCollapsed, deptName);
      });
    });

    DOM.documentsTableBody.innerHTML = tableHtml;

    // Attach group header toggle listeners
    DOM.documentsTableBody.querySelectorAll('.table-group-header-row').forEach(headerRow => {
      headerRow.addEventListener('click', () => {
        const groupName = headerRow.getAttribute('data-group-name');
        if (AppState.collapsedGroups.has(groupName)) {
          AppState.collapsedGroups.delete(groupName);
        } else {
          AppState.collapsedGroups.add(groupName);
        }
        renderTableRows(AppState.filteredDocuments);
        initLucideIcons();
      });
    });

  } else {
    // Flat Table
    if (DOM.btnToggleAllGroups) DOM.btnToggleAllGroups.classList.add('hidden');

    DOM.documentsTableBody.innerHTML = docs.map((doc, idx) => {
      return generateTableRowHtml(doc, idx, false, null);
    }).join('');
  }

  // Attach row event listeners (Preview)
  DOM.documentsTableBody.querySelectorAll('.btn-table-preview').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const doc = AppState.allDocuments.find(d => d.id === id);
      if (doc) openPreviewModal(doc);
    });
  });

  // Attach row event listeners (Edit)
  DOM.documentsTableBody.querySelectorAll('.btn-table-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openEditDocModal(id);
    });
  });

  // Attach row event listeners (Delete - Admin only)
  DOM.documentsTableBody.querySelectorAll('.btn-table-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!AuthStore.isAdmin(AppState.currentUser)) {
        showToast('Chỉ tài khoản Quản trị (Ban Giám Đốc) mới có quyền xóa tài liệu!', 'warning');
        return;
      }
      const id = btn.getAttribute('data-id');
      const doc = AppState.allDocuments.find(d => d.id === id);
      if (doc) openDeleteConfirmModal(doc);
    });
  });

  // Attach version history button click
  DOM.documentsTableBody.querySelectorAll('.btn-version-history-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = btn.getAttribute('data-code');
      openVersionHistoryModal(code);
    });
  });
}

/**
 * Generate HTML string for a single table row (Works seamlessly on desktop table and mobile row-card)
 */
function generateTableRowHtml(doc, idx, isCollapsed, groupName) {
  const isAdmin = AuthStore.isAdmin(AppState.currentUser);
  const catClass = getCategoryClass(doc.category);
  const deptMeta = DEPARTMENT_COLORS[doc.department] || { icon: 'building', border: '#4F46E5', text: '#4F46E5' };
  const directDownloadUrl = getDriveDownloadUrl(doc.driveUrl);
  const groupClass = groupName ? `table-group-row ${isCollapsed ? 'collapsed' : ''}` : '';

  return `
    <tr class="table-doc-row ${groupClass}" data-id="${doc.id}">
      <td class="col-idx" style="color: var(--text-muted); font-size: 0.8rem; text-align: center;">${idx + 1}</td>
      <td class="col-code">
        <span class="doc-code-badge">${escapeHtml(doc.code)}</span>
      </td>
      <td class="col-title">
        <div class="table-doc-title">${escapeHtml(doc.title)}</div>
        <div class="table-doc-desc">${escapeHtml(doc.description)}</div>
      </td>
      <td class="col-dept">
        <span class="table-dept-pill" style="color: ${deptMeta.text}; background: ${deptMeta.border}15;">
          <i data-lucide="${deptMeta.icon || 'building'}"></i>
          <span>${escapeHtml(doc.department)}</span>
        </span>
      </td>
      <td class="col-cat">
        <span class="doc-cat-badge ${catClass}">${escapeHtml(doc.category)}</span>
      </td>
      <td class="col-ver" style="text-align: center;">
        <button type="button" class="btn-version-history-chip" data-code="${escapeHtml(doc.code)}" title="Xem lịch sử thay đổi & lý do cập nhật (${escapeHtml(doc.version)})">
          <span>${escapeHtml(doc.version || 'v1.0')}</span>
          <i data-lucide="history" style="width: 12px; height: 12px;"></i>
        </button>
      </td>
      <td class="col-date">
        <span>${formatDate(doc.updatedAt)}</span>
      </td>
      <td class="col-actions">
        <div class="table-actions">
          <button class="table-btn preview btn-table-preview" 
                  data-id="${doc.id}" 
                  title="Xem chi tiết & đọc tài liệu trực tuyến"
                  aria-label="Xem chi tiết">
            <i data-lucide="eye"></i>
          </button>
          <button class="table-btn edit btn-table-edit" 
                  data-id="${doc.id}" 
                  title="Sửa link Google Drive & nội dung quy trình"
                  aria-label="Chỉnh sửa">
            <i data-lucide="edit-3"></i>
          </button>
          ${isAdmin ? `
            <button class="table-btn delete btn-table-delete" 
                    data-id="${doc.id}" 
                    data-code="${escapeHtml(doc.code)}" 
                    title="Xóa tài liệu này (Chỉ Admin)"
                    aria-label="Xóa tài liệu">
              <i data-lucide="trash-2"></i>
            </button>
          ` : ''}
          <a href="${directDownloadUrl}" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="table-btn download"
             title="Tải ngay file gốc từ Google Drive về máy"
             aria-label="Tải file">
            <i data-lucide="download"></i>
          </a>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Toggle All Table Groups (Expand All vs Collapse All)
 */
function toggleAllTableGroups() {
  const docs = AppState.filteredDocuments;
  const depts = Array.from(new Set(docs.map(d => d.department)));

  if (AppState.collapsedGroups.size === depts.length) {
    // All are collapsed -> expand all
    AppState.collapsedGroups.clear();
    if (DOM.textToggleAllGroups) DOM.textToggleAllGroups.textContent = 'Thu gọn tất cả';
  } else {
    // Collapse all
    depts.forEach(d => AppState.collapsedGroups.add(d));
    if (DOM.textToggleAllGroups) DOM.textToggleAllGroups.textContent = 'Mở rộng tất cả';
  }

  renderTableRows(docs);
  initLucideIcons();
}

/**
 * Export Filtered Documents to Excel (.csv format with UTF-8 BOM)
 */
function exportFilteredDocumentsToExcel() {
  const docs = AppState.filteredDocuments;
  if (!docs || docs.length === 0) {
    showToast('Không có dữ liệu tài liệu để xuất!', 'warning');
    return;
  }

  // Header row
  const headers = [
    'STT',
    'Mã tài liệu',
    'Tên quy trình / Hướng dẫn',
    'Phòng ban',
    'Phân loại',
    'Phiên bản',
    'Ngày ban hành / Cập nhật',
    'Link Google Drive',
    'Mô tả chi tiết'
  ];

  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const cleanStr = String(str).replace(/"/g, '""');
    return `"${cleanStr}"`;
  };

  const csvRows = [];
  csvRows.push(headers.map(escapeCsv).join(','));

  docs.forEach((doc, idx) => {
    const row = [
      idx + 1,
      doc.code || '',
      doc.title || '',
      doc.department || '',
      doc.category || '',
      doc.version || 'v1.0',
      doc.updatedAt || '',
      doc.driveUrl || '',
      doc.description || ''
    ];
    csvRows.push(row.map(escapeCsv).join(','));
  });

  // UTF-8 Byte Order Mark (\uFEFF) ensures Excel displays Vietnamese correctly
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ProcessHub_BaoCaoQuyTrinh_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`Đã xuất thành công ${docs.length} tài liệu ra file Excel!`, 'success');
}

/**
 * Preview Modal Controller (Supports Single or Multiple Named Links)
 */
function openPreviewModal(doc) {
  AppState.activePreviewDoc = doc;

  DOM.previewTitle.textContent = doc.title;
  DOM.previewMeta.textContent = `Mã số: ${doc.code} • Phòng ban: ${doc.department} • Cập nhật: ${formatDate(doc.updatedAt)}`;
  DOM.previewBadgeCategory.textContent = doc.category;
  DOM.previewBadgeCategory.className = `cat-badge ${getCategoryClass(doc.category)}`;

  DOM.previewDesc.textContent = doc.description || 'Chưa có thông tin mô tả chi tiết.';
  DOM.previewCode.textContent = doc.code;
  DOM.previewVersion.textContent = doc.version;
  DOM.previewDept.textContent = doc.department;
  DOM.previewDate.textContent = formatDate(doc.updatedAt);

  // Favorite button state
  const isFav = DataStore.isFavorite(doc.id);
  DOM.btnPreviewFav.classList.toggle('is-fav', isFav);

  // Delete button state (Admin only)
  if (DOM.btnPreviewDelete) {
    if (AuthStore.isAdmin(AppState.currentUser)) {
      DOM.btnPreviewDelete.classList.remove('hidden');
    } else {
      DOM.btnPreviewDelete.classList.add('hidden');
    }
  }

  // Render dynamic links list and setup initial preview
  renderPreviewLinks(doc, 0);

  DOM.modalPreview.classList.remove('hidden');
  initLucideIcons();
}

function renderPreviewLinks(doc, activeIndex = 0) {
  if (!DOM.previewLinksContainer) return;
  const links = parseDocumentLinks(doc);

  if (DOM.previewLinksCount) {
    DOM.previewLinksCount.textContent = links.length <= 1 ? '1 file' : `${links.length} files / links`;
  }

  if (links.length === 0) {
    DOM.previewLinksContainer.innerHTML = `
      <div class="empty-links-hint">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.5rem 0;">Chưa có đường dẫn tài liệu đính kèm.</p>
      </div>
    `;
    updatePreviewIframe('');
    return;
  }

  if (activeIndex < 0 || activeIndex >= links.length) activeIndex = 0;
  const activeLink = links[activeIndex];

  // Update Preview iframe with active link
  updatePreviewIframe(activeLink.url);

  if (links.length === 1) {
    const directDownload = getDriveDownloadUrl(activeLink.url);
    DOM.previewLinksContainer.innerHTML = `
      <div class="single-link-title" title="${escapeHtml(activeLink.name)}">
        <i data-lucide="file-check-2"></i>
        <span>${escapeHtml(activeLink.name)}</span>
      </div>
      <a href="${directDownload}" target="_blank" class="btn primary btn-block btn-download-hero" title="Tải trực tiếp về máy">
        <i data-lucide="download"></i>
        <span>Tải trực tiếp từ Google Drive</span>
      </a>
      <div class="action-btn-row">
        <a href="${activeLink.url || '#'}" target="_blank" class="btn secondary btn-sm-flex" title="Mở link trong tab mới">
          <i data-lucide="external-link"></i>
          <span>Mở Google Drive</span>
        </a>
        <button type="button" class="btn outline btn-sm-flex btn-copy-single-link" data-url="${activeLink.url}" title="Sao chép link tải vào Clipboard">
          <i data-lucide="copy"></i>
          <span>Sao chép link</span>
        </button>
      </div>
    `;
  } else {
    // Multiple links: List of named cards
    let html = '';
    links.forEach((item, idx) => {
      const isActive = idx === activeIndex;
      const directDownload = getDriveDownloadUrl(item.url);
      html += `
        <div class="preview-link-card ${isActive ? 'is-active' : ''}" data-index="${idx}">
          <div class="link-card-top">
            <div class="link-card-title-group">
              <span class="link-index-badge">${idx + 1}</span>
              <div class="link-card-info">
                <h4 class="link-card-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</h4>
                <div style="display: flex; gap: 0.35rem; align-items: center; margin-top: 0.2rem;">
                  <span class="link-card-tag">${idx === 0 ? 'File chính' : 'Đính kèm'}</span>
                  ${isActive ? '<span class="link-viewing-badge"><i data-lucide="eye"></i> Đang xem</span>' : ''}
                </div>
              </div>
            </div>
          </div>
          <div class="link-card-actions">
            <button type="button" class="btn ${isActive ? 'primary' : 'outline'} btn-preview-switch-link" data-index="${idx}" title="Xem trước file này ở khung bên phải">
              <i data-lucide="eye"></i>
              <span>${isActive ? 'Đang xem' : 'Xem file'}</span>
            </button>
            <a href="${directDownload}" target="_blank" class="btn secondary" title="Tải trực tiếp file này">
              <i data-lucide="download"></i>
              <span>Tải</span>
            </a>
            <a href="${item.url || '#'}" target="_blank" class="btn outline icon-only" title="Mở trên Google Drive">
              <i data-lucide="external-link"></i>
            </a>
            <button type="button" class="btn outline icon-only btn-copy-single-link" data-url="${item.url}" title="Sao chép link file này">
              <i data-lucide="copy"></i>
            </button>
          </div>
        </div>
      `;
    });
    DOM.previewLinksContainer.innerHTML = html;
  }

  // Attach event listeners for copy buttons
  DOM.previewLinksContainer.querySelectorAll('.btn-copy-single-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.getAttribute('data-url');
      if (url) {
        const direct = getDriveDownloadUrl(url);
        navigator.clipboard.writeText(direct).then(() => {
          showToast('Đã sao chép link tải vào Clipboard!', 'success');
        }).catch(() => {
          showToast('Không thể sao chép link tự động.', 'error');
        });
      }
    });
  });

  // Attach event listeners for switching active preview
  DOM.previewLinksContainer.querySelectorAll('.btn-preview-switch-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetIdx = parseInt(btn.getAttribute('data-index'), 10);
      renderPreviewLinks(doc, targetIdx);
    });
  });

  initLucideIcons();
}

function updatePreviewIframe(url) {
  if (!DOM.previewIframe) return;
  const directDownload = getDriveDownloadUrl(url);
  if (DOM.previewFallbackBtn) DOM.previewFallbackBtn.href = directDownload;

  const driveFileId = extractDriveFileId(url);
  if (driveFileId) {
    const previewUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;
    DOM.previewIframe.src = previewUrl;
    if (DOM.previewIframeWrapper) DOM.previewIframeWrapper.classList.remove('hidden');
    if (DOM.previewIframeFallback) DOM.previewIframeFallback.classList.add('hidden');
  } else {
    DOM.previewIframe.src = '';
    if (DOM.previewIframeWrapper) DOM.previewIframeWrapper.classList.add('hidden');
    if (DOM.previewIframeFallback) DOM.previewIframeFallback.classList.remove('hidden');
  }
}

function closePreviewModal() {
  DOM.modalPreview.classList.add('hidden');
  DOM.previewIframe.src = ''; // stop any playing video/media
  AppState.activePreviewDoc = null;
}

function togglePreviewDocFav() {
  if (!AppState.activePreviewDoc) return;
  const nowFav = DataStore.toggleFavorite(AppState.activePreviewDoc.id);
  DOM.btnPreviewFav.classList.toggle('is-fav', nowFav);
  updateFavoritesCounter();
  applyFiltersAndRender();
  showToast(nowFav ? 'Đã lưu vào danh sách yêu thích' : 'Đã bỏ yêu thích', 'info');
}

function copyPreviewDocLink() {
  if (!AppState.activePreviewDoc) return;
  const directLink = getDriveDownloadUrl(AppState.activePreviewDoc.driveUrl);
  navigator.clipboard.writeText(directLink).then(() => {
    showToast('Đã sao chép link tải vào Clipboard!', 'success');
  }).catch(() => {
    showToast('Không thể sao chép link tự động.', 'error');
  });
}

/**
 * Auth & User Profile Controller
 */
function updateAuthUI() {
  const user = AppState.currentUser;

  // Top navigation profile button
  if (DOM.navUserName) {
    DOM.navUserName.textContent = user ? (user.fullName || user.username) : 'Đăng nhập';
  }
  if (DOM.navUserIcon) {
    DOM.navUserIcon.setAttribute('data-lucide', user ? (user.avatarIcon || 'shield-check') : 'log-in');
  }

  // Active account card inside login modal
  const currentCard = document.getElementById('current-account-card');
  if (currentCard) {
    currentCard.style.display = user ? 'flex' : 'none';
  }

  if (user) {
    if (DOM.authCurrentAvatar) {
      DOM.authCurrentAvatar.setAttribute('data-lucide', user.avatarIcon || 'shield-check');
    }
    if (DOM.authCurrentName) {
      DOM.authCurrentName.textContent = user.fullName;
    }
    if (DOM.authCurrentRole) {
      DOM.authCurrentRole.textContent = user.role === 'Admin' ? 'Toàn quyền (Admin)' : `Nhân viên (${user.department})`;
    }
    if (DOM.authCurrentDept) {
      DOM.authCurrentDept.textContent = `Bộ phận: ${user.department}`;
    }
    if (DOM.authCurrentAllowed) {
      const allowedText = user.allowedDepartments.includes('*') 
        ? 'Xem: Tất cả 5 bộ phận (*)' 
        : `Xem: ${user.allowedDepartments.join(', ')}`;
      DOM.authCurrentAllowed.innerHTML = `<i data-lucide="eye"></i> <span>${escapeHtml(allowedText)}</span>`;
    }
  }

  // Update dynamic quick switch chips based on AuthStore.getAccounts() (supports Google Sheets sync)
  renderQuickAccountsGrid();

  // Settings button strictly for Admin / Ban Giám Đốc only
  const isAdmin = AuthStore.isAdmin(user);
  if (DOM.btnOpenSettings) {
    DOM.btnOpenSettings.classList.toggle('hidden', !isAdmin);
  }
  if (DOM.mobileNavSettings) {
    DOM.mobileNavSettings.classList.toggle('hidden', !isAdmin);
  }
  if (DOM.btnFooterGuide) {
    DOM.btnFooterGuide.classList.toggle('hidden', !isAdmin);
  }

  // If settings modal is open and user is not admin, close it immediately
  if (!isAdmin && DOM.modalSettings && !DOM.modalSettings.classList.contains('hidden')) {
    closeSettingsModal();
  }

  initLucideIcons();
}

/**
 * Render Quick Account Switcher Chips dynamically based on AuthStore.getAccounts()
 */
function renderQuickAccountsGrid() {
  const container = DOM.quickAccountsGrid || document.getElementById('quick-accounts-grid');
  if (!container) return;

  const accounts = AuthStore.getAccounts();
  const currentUser = AppState.currentUser;

  container.innerHTML = accounts.map(acc => {
    const isActive = currentUser && currentUser.username.toLowerCase() === acc.username.toLowerCase();
    let emoji = '💼';
    if (acc.role === 'Admin' || acc.username.toLowerCase() === 'admin') emoji = '👑';
    else if (acc.department.includes('Kỹ Thuật') || acc.department.includes('Thiết Kế')) emoji = '🏛️';
    else if (acc.department.includes('Sản Xuất')) emoji = '🏭';
    else if (acc.department.includes('Kinh Doanh')) emoji = '💼';
    else if (acc.department.includes('Hành Chính') || acc.department.includes('Nhân Sự')) emoji = '📑';

    const shortAllowed = (acc.allowedDepartments && acc.allowedDepartments.includes('*'))
      ? 'Toàn quyền (*)'
      : (acc.allowedDepartments ? acc.allowedDepartments.map(d => d.replace('Bộ phận ', '')).join(' + ') : acc.department);

    return `
      <button type="button" class="quick-user-chip ${isActive ? 'active' : ''}" data-username="${escapeHtml(acc.username)}" data-password="${escapeHtml(acc.password)}">
        <span class="quick-chip-icon">${emoji}</span>
        <div class="quick-chip-text">
          <strong>${escapeHtml(acc.username)}</strong>
          <small>${escapeHtml(shortAllowed)}</small>
        </div>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.quick-user-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const uName = chip.getAttribute('data-username');
      const uPass = chip.getAttribute('data-password');
      if (DOM.inputLoginUsername) DOM.inputLoginUsername.value = uName;
      if (DOM.inputLoginPassword) DOM.inputLoginPassword.value = uPass;
      handleLoginSubmit();
    });
  });
}

function openLoginModal(isMandatory = false) {
  if (!DOM.modalLogin) return;
  updateAuthUI();

  // Prefill admin / 1612 by default for convenience
  if (DOM.inputLoginUsername) {
    DOM.inputLoginUsername.value = 'admin';
  }
  if (DOM.inputLoginPassword) {
    DOM.inputLoginPassword.value = '1612';
  }

  if (DOM.loginErrorMsg) {
    DOM.loginErrorMsg.classList.add('hidden');
    DOM.loginErrorMsg.textContent = '';
  }

  DOM.modalLogin.classList.remove('hidden');

  // Focus submit button so pressing Enter or clicking immediately logs in
  if (DOM.btnSubmitLogin) {
    setTimeout(() => {
      DOM.btnSubmitLogin.focus();
    }, 120);
  }

  initLucideIcons();
}

function closeLoginModal() {
  if (DOM.modalLogin) {
    DOM.modalLogin.classList.add('hidden');
  }
}

function togglePasswordVisibility() {
  if (!DOM.inputLoginPassword) return;
  const isPass = DOM.inputLoginPassword.type === 'password';
  DOM.inputLoginPassword.type = isPass ? 'text' : 'password';
  if (DOM.eyeIcon) {
    DOM.eyeIcon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
    initLucideIcons();
  }
}

function handleLoginSubmit() {
  const username = DOM.inputLoginUsername ? DOM.inputLoginUsername.value.trim() : '';
  const password = DOM.inputLoginPassword ? DOM.inputLoginPassword.value.trim() : '';

  if (!username) {
    if (DOM.loginErrorMsg) {
      DOM.loginErrorMsg.textContent = 'Vui lòng nhập tên tài khoản!';
      DOM.loginErrorMsg.classList.remove('hidden');
    }
    return;
  }

  const result = AuthStore.login(username, password);
  if (result.success) {
    AppState.currentUser = result.user;
    updateAuthUI();
    AppState.selectedDepartment = 'all';
    populateDepartmentOptions();
    applyFiltersAndRender();
    closeLoginModal();
    const deptInfo = result.user.allowedDepartments.includes('*') 
      ? 'Toàn bộ 5 bộ phận' 
      : result.user.allowedDepartments.join(', ');
    showToast(`Đã đăng nhập: ${result.user.fullName} (${deptInfo})`, 'success');
  } else {
    if (DOM.loginErrorMsg) {
      DOM.loginErrorMsg.textContent = result.message || 'Sai tên đăng nhập hoặc mật khẩu!';
      DOM.loginErrorMsg.classList.remove('hidden');
    }
    showToast(result.message || 'Đăng nhập không thành công', 'warning');
  }
}

function handleLogout() {
  AuthStore.logout();
  AppState.currentUser = null;
  if (DOM.inputLoginUsername) DOM.inputLoginUsername.value = 'admin';
  if (DOM.inputLoginPassword) DOM.inputLoginPassword.value = '1612';
  updateAuthUI();
  AppState.selectedDepartment = 'all';
  populateDepartmentOptions();
  applyFiltersAndRender();
  showToast('Đã đăng xuất. Vui lòng đăng nhập để tiếp tục.', 'info');
  openLoginModal(true);
}

/**
 * Settings Modal Controller
 */
function openSettingsModal() {
  if (!AuthStore.isAdmin(AppState.currentUser)) {
    showToast('Chỉ tài khoản Ban Giám Đốc (Admin) mới có quyền xem Cài đặt hệ thống.', 'warning');
    return;
  }

  const currentConfig = DataStore.getSheetConfig();
  const rawSheetUrl = (currentConfig && (currentConfig.rawInput || currentConfig.sheetId)) || DEFAULT_SHEET_CONFIG.sheetId;
  const currentAiUrl = DataStore.getAiAssistantUrl();

  // Populate Link 1: Sheet URL & Open Link
  const viewSheetUrl = document.getElementById('view-sheet-url');
  if (viewSheetUrl) {
    viewSheetUrl.textContent = rawSheetUrl;
  }
  const linkOpenSheet = document.getElementById('link-open-sheet');
  if (linkOpenSheet) {
    linkOpenSheet.href = rawSheetUrl;
  }

  // Populate Link 2: AI URL & Open Link
  const viewAiUrl = document.getElementById('view-ai-url');
  if (viewAiUrl) {
    viewAiUrl.textContent = currentAiUrl;
  }
  const linkOpenAi = document.getElementById('link-open-ai');
  if (linkOpenAi) {
    linkOpenAi.href = currentAiUrl;
  }

  // Pre-fill collapsible edit sheet fields if admin opens edit mode
  if (DOM.inputSheetUrl) {
    DOM.inputSheetUrl.value = (currentConfig && (currentConfig.rawInput || currentConfig.sheetId)) || '';
  }
  if (DOM.inputSheetTab) {
    DOM.inputSheetTab.value = (currentConfig && currentConfig.tabName) || '';
  }

  // Reset collapsible edit boxes to hidden by default
  const boxEditSheet = document.getElementById('box-edit-sheet');
  if (boxEditSheet) {
    boxEditSheet.classList.add('hidden');
  }
  if (DOM.sheetConnectionStatus) {
    DOM.sheetConnectionStatus.classList.add('hidden');
  }

  const boxEditAi = document.getElementById('box-edit-ai');
  if (boxEditAi) {
    boxEditAi.classList.add('hidden');
  }
  const inputAiUrl = document.getElementById('input-ai-url');
  if (inputAiUrl) {
    inputAiUrl.value = currentAiUrl;
  }
  const aiConnectionStatus = document.getElementById('ai-connection-status');
  if (aiConnectionStatus) {
    aiConnectionStatus.classList.add('hidden');
  }

  DOM.modalSettings.classList.remove('hidden');
  initLucideIcons();
}

function closeSettingsModal() {
  DOM.modalSettings.classList.add('hidden');
}

async function testSheetConnection() {
  if (!DOM.inputSheetUrl) return;
  const rawInput = DOM.inputSheetUrl.value.trim();
  const tabName = DOM.inputSheetTab ? DOM.inputSheetTab.value.trim() : '';
  const sheetId = extractSheetId(rawInput);

  if (!sheetId) {
    showConnectionStatus(false, 'Vui lòng nhập đúng đường dẫn hoặc ID của Google Sheets.');
    return;
  }

  showConnectionStatus(true, 'Đang kết nối thử nghiệm đến Google Sheets...', true);

  try {
    const docs = await fetchGoogleSheetData(sheetId, tabName);
    showConnectionStatus(true, `Kết nối thành công! Đã đọc được ${docs.length} tài liệu hợp lệ từ trang tính.`);
  } catch (err) {
    showConnectionStatus(false, err.message || 'Lỗi kết nối. Vui lòng kiểm tra quyền chia sẻ công khai.');
  }
}

async function saveAndSyncSheet() {
  if (!DOM.inputSheetUrl) return;
  const rawInput = DOM.inputSheetUrl.value.trim();
  const tabName = DOM.inputSheetTab ? DOM.inputSheetTab.value.trim() : '';
  const sheetId = extractSheetId(rawInput);

  if (!sheetId) {
    showToast('Vui lòng nhập đường dẫn Google Sheets hoặc Web App hợp lệ.', 'warning');
    return;
  }

  try {
    if (DOM.btnSaveSettings) {
      DOM.btnSaveSettings.disabled = true;
      DOM.btnSaveSettings.textContent = 'Đang đồng bộ...';
    }

    const docs = await fetchGoogleSheetData(sheetId, tabName);
    
    // Save configuration
    DataStore.setSheetConfig({ rawInput, sheetId, tabName });
    DataStore.setDocuments(docs);
    AppState.allDocuments = docs;

    // Update view text immediately
    const viewSheetUrl = document.getElementById('view-sheet-url');
    if (viewSheetUrl) viewSheetUrl.textContent = rawInput || sheetId;
    const linkOpenSheet = document.getElementById('link-open-sheet');
    if (linkOpenSheet) linkOpenSheet.href = rawInput || sheetId;

    const boxEditSheet = document.getElementById('box-edit-sheet');
    if (boxEditSheet) boxEditSheet.classList.add('hidden');

    updateDataStatusBadge(true, 'Đã đồng bộ Google Sheets');
    populateDepartmentOptions();
    applyFiltersAndRender();
    closeSettingsModal();
    showToast(`Đã đồng bộ thành công ${docs.length} tài liệu từ Google Sheets!`, 'success');
  } catch (err) {
    showToast(err.message || 'Đồng bộ thất bại. Vui lòng kiểm tra lại cấu hình.', 'error');
  } finally {
    if (DOM.btnSaveSettings) {
      DOM.btnSaveSettings.disabled = false;
      DOM.btnSaveSettings.innerHTML = '<i data-lucide="save"></i> Lưu & Đồng bộ';
    }
    initLucideIcons();
  }
}

async function syncFromConfiguredSheet(showNotification = false) {
  const config = DataStore.getSheetConfig();
  if (!config || !config.sheetId) {
    openSettingsModal();
    return;
  }

  updateDataStatusBadge(false, 'Đang đồng bộ Google Sheets...');
  if (DOM.btnSyncData) DOM.btnSyncData.classList.add('pulsing');
  try {
    const docs = await fetchGoogleSheetData(config.sheetId, config.tabName);
    DataStore.setDocuments(docs);
    AppState.allDocuments = docs;
    updateDataStatusBadge(true, 'Đã đồng bộ Google Sheets');
    populateDepartmentOptions();
    applyFiltersAndRender();
    if (showNotification) {
      showToast(`Đã đồng bộ thành công ${docs.length} tài liệu từ Google Sheets!`, 'success');
    }
  } catch (err) {
    updateDataStatusBadge(false, 'Chưa đồng bộ Google Sheets');
    if (showNotification) {
      showToast('Không thể kết nối đến Google Sheets. Đang dùng dữ liệu đã lưu.', 'warning');
    }
  } finally {
    if (DOM.btnSyncData) DOM.btnSyncData.classList.remove('pulsing');
  }
}

function showConnectionStatus(isSuccess, message, isPending = false) {
  DOM.sheetConnectionStatus.classList.remove('hidden', 'success', 'error');
  if (isPending) {
    DOM.sheetConnectionStatus.style.background = 'var(--bg-tertiary)';
    DOM.sheetConnectionStatus.style.color = 'var(--text-main)';
  } else {
    DOM.sheetConnectionStatus.classList.add(isSuccess ? 'success' : 'error');
  }
  DOM.sheetConnectionStatus.textContent = message;
}

/**
 * Generate & Download CSV Template for user to copy into Google Sheets
 */
function downloadCsvSample() {
  const csvContent = 
`Mã tài liệu,Tên tài liệu,Phòng ban,Phân loại,Phiên bản,Ngày ban hành,Link Google Drive,Mô tả tóm tắt,Từ khóa
QT-TK-01,Quy trình thiết kế phương án kiến trúc & nội thất,Bộ phận Kỹ Thuật,Quy trình,v3.2,2026-10-10,https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing,"Quy định các bước từ tiếp nhận brief khách hàng, lên concept 2D/3D, duyệt phương án với chủ đầu tư đến bàn giao hồ sơ thiết kế kỹ thuật.","kiến trúc, nội thất, concept, 3d, brief"
QC-BV-02,Quy chuẩn thể hiện hồ sơ bản vẽ kỹ thuật thi công (CAD & Revit),Bộ phận Kỹ Thuật,Quy chuẩn,v2.0,2026-09-25,https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing,"Bộ tiêu chuẩn nét vẽ, tỷ lệ, ký hiệu vật liệu, quy cách đóng khung tên bản vẽ cho toàn bộ kiến trúc sư và họa viên tại H-Design.","bản vẽ, cad, revit, tiêu chuẩn nét"
HD-SX-01,Hướng dẫn vận hành máy CNC máy dán cạnh & kiểm soát chất lượng gia công xưởng,Bộ phận Sản Xuất,Hướng dẫn,v2.5,2026-10-05,https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing,"Chỉ dẫn chi tiết cách vận hành máy móc xưởng gỗ, kiểm tra đường cắt CNC, độ bám keo dán cạnh và lập biên bản kiểm tra bán thành phẩm.","sản xuất, xưởng, cnc, chất lượng, máy móc"
QT-SX-02,Quy trình nghiệm thu vật tư gỗ cơ khí phụ kiện đầu vào & bàn giao xuất xưởng,Bộ phận Sản Xuất,Quy trình,v1.8,2026-08-30,https://drive.google.com/file/d/1D_Sample_NghiemThuVatTu_DriveFile/view?usp=sharing,"Các bước đối chiếu mẫu ván An Cường, phụ kiện Hafele/Blum thực tế với catalogue đã duyệt, kiểm tra chứng chỉ xuất xưởng trước khi gia công.","nghiệm thu, vật tư, sản xuất, gỗ, phụ kiện"
BM-SX-01,Mẫu báo cáo tiến độ sản xuất xưởng & kế hoạch phân bổ nguồn lực tuần,Bộ phận Sản Xuất,Biểu mẫu,v4.0,2026-10-12,https://drive.google.com/file/d/1E_Sample_BieuMauTienDoDuAn_DriveFile/view?usp=sharing,"Biểu mẫu chuẩn Gantt chart và bảng theo dõi tiến độ gia công từng đơn hàng, cảnh báo rủi ro trễ tiến độ lắp đặt công trình.","tiến độ, biểu mẫu, sản xuất, gantt, báo cáo tuần"
QT-NS-01,Quy trình tuyển dụng đào tạo & tiếp nhận nhân sự mới (Onboarding),Hành Chính - Nhân Sự,Quy trình,v2.1,2026-09-18,https://drive.google.com/file/d/1F_Sample_OnboardingHR_DriveFile/view?usp=sharing,"Hướng dẫn các bước từ phỏng vấn, thẩm định năng lực, cấp phát thiết bị làm việc, giới thiệu văn hóa doanh nghiệp đến kết thúc 2 tháng thử việc.","nhân sự, onboarding, thử việc, tuyển dụng"
HD-HC-02,Hướng dẫn đề nghị tạm ứng thanh toán chi phí & nội quy văn phòng,Hành Chính - Nhân Sự,Hướng dẫn,v2.2,2026-10-01,https://drive.google.com/file/d/1G_Sample_TamUngThanhToan_DriveFile/view?usp=sharing,"Thời hạn gửi chứng từ hợp lệ, hạn mức chi tiêu ăn ở đi lại khi công tác, quy định giờ giấc làm việc và văn hóa ứng xử nội bộ.","hành chính, nhân sự, tạm ứng, thanh toán, nội quy"
QC-AT-01,Quy chuẩn an toàn lao động vệ sinh công nghiệp & PCCC tại phân xưởng,Bộ phận Sản Xuất,Quy chuẩn,v3.0,2026-07-20,https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing,"Quy định bắt buộc về trang bị bảo hộ cá nhân (kính, khẩu trang, găng tay), an toàn nguồn điện máy công nghiệp và phòng chống cháy nổ.","an toàn, bảo hộ, pccc, sản xuất, xưởng, vệ sinh"
QT-KD-02,Quy trình tư vấn khách hàng lập báo giá & ký kết hợp đồng thi công,Bộ phận Kinh Doanh,Quy trình,v1.5,2026-08-14,https://drive.google.com/file/d/1I_Sample_BaoGiaHopDong_DriveFile/view?usp=sharing,"Quy định cơ chế tính giá theo đơn giá thiết kế & thi công trọn gói, thẩm quyền chiết khấu cho khách hàng và quy trình rà soát hợp đồng mẫu.","hợp đồng, báo giá, sale, khách hàng, chiết khấu"
CS-GD-01,Chính sách bảo mật thông tin nội bộ quản lý dữ liệu & phân quyền tài liệu,Ban Giám Đốc,Chính sách,v1.2,2026-06-30,https://drive.google.com/file/d/1J_Sample_BaoMatThongTin_DriveFile/view?usp=sharing,"Quy định phân quyền truy cập tài liệu giữa các bộ phận, bảo mật file thiết kế 3D/CAD của khách hàng và cam kết bảo mật NDA của nhân sự.","bảo mật, chính sách, nda, tài sản trí tuệ, giám đốc"
BM-TK-04,Checklist kiểm tra hồ sơ thiết kế chi tiết trước khi chuyển giao xưởng sản xuất,Bộ phận Kỹ Thuật,Biểu mẫu,v2.8,2026-10-14,https://drive.google.com/file/d/1K_Sample_ChecklistDesignQA_DriveFile/view?usp=sharing,"Bảng kiểm tra 45 đầu việc kỹ thuật gồm: kích thước công thái học, khớp nối vật liệu, file cắt CNC và bảng bóc tách khối lượng phụ kiện.","checklist, qa, kiểm tra, bàn giao, hồ sơ thiết kế"
BM-KD-01,Biểu mẫu khảo sát nhu cầu khách hàng & bảng phân tích hiện trạng dự án,Bộ phận Kinh Doanh,Biểu mẫu,v1.4,2026-09-02,https://drive.google.com/file/d/1L_Sample_ITGuide_DriveFile/view?usp=sharing,"Phiếu thu thập thông tin khách hàng: phong cách mong muốn, ngân sách đầu tư, tiến độ yêu cầu và đặc điểm mặt bằng cần cải tạo.","kinh doanh, khảo sát, brief, khách hàng, tư vấn"`;

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'ProcessHub_Template_MauGoogleSheet.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Đã tải xuống file CSV mẫu để import vào Google Sheets', 'success');
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  if (!DOM.toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle-2';
  if (type === 'warning') iconName = 'alert-triangle';
  if (type === 'error') iconName = 'alert-circle';

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);
  initLucideIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Update Favorites Counter in Filter bar
 */
function updateFavoritesCounter() {
  const count = DataStore.getFavorites().length;
  if (DOM.favoriteCount) {
    DOM.favoriteCount.textContent = count;
  }
  if (DOM.catFavCount) {
    DOM.catFavCount.textContent = count;
  }
  if (DOM.mobileFavBadge) {
    DOM.mobileFavBadge.textContent = count;
    DOM.mobileFavBadge.style.display = count > 0 ? 'flex' : 'none';
  }
}

/**
 * String Helpers & Formatters
 */
function normalizeSearchString(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip vietnamese diacritics
    .replace(/đ/g, 'd')
    .trim();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getCategoryClass(category) {
  switch (category) {
    case 'Quy trình': return 'cat-quy-trinh';
    case 'Tiêu chuẩn':
    case 'Quy chuẩn': return 'cat-tieu-chuan';
    case 'Hướng dẫn': return 'cat-huong-dan';
    case 'Biểu mẫu': return 'cat-bieu-mau';
    case 'Bản vẽ': return 'cat-ban-ve';
    case 'Chính sách': return 'cat-chinh-sach';
    default: return 'cat-quy-trinh';
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ==========================================================================
 * Version History & Change Log Controller
 * ==========================================================================
 */

function openVersionHistoryModal(docCode) {
  if (!DOM.modalVersionHistory) return;

  const targetCode = (docCode || '').trim().toLowerCase();
  const doc = AppState.allDocuments.find(d => (d.code || '').trim().toLowerCase() === targetCode)
           || DEFAULT_MOCK_DOCUMENTS.find(d => (d.code || '').trim().toLowerCase() === targetCode)
           || { code: docCode, title: 'Tài liệu quy trình', department: 'Bộ phận Kỹ Thuật', category: 'Quy trình', version: 'v1.0' };

  const historyList = DataStore.getVersionHistoryForDoc(doc);
  const activeVer = historyList.find(h => h.status === 'active') || historyList[0] || {};

  // Populate Header
  if (DOM.vhDocCode) DOM.vhDocCode.textContent = doc.code;
  if (DOM.vhDocTitle) DOM.vhDocTitle.textContent = doc.title;
  if (DOM.vhDocCategory) {
    DOM.vhDocCategory.textContent = doc.category;
    DOM.vhDocCategory.className = `cat-badge ${getCategoryClass(doc.category)}`;
  }
  if (DOM.vhDocDept) {
    DOM.vhDocDept.textContent = doc.department;
  }

  // Populate Active Highlight Card
  if (DOM.vhActiveVersionTag) DOM.vhActiveVersionTag.textContent = activeVer.version || doc.version || 'v1.0';
  if (DOM.vhActiveDate) DOM.vhActiveDate.textContent = formatDate(activeVer.releaseDate || doc.updatedAt);
  if (DOM.vhActiveAuthor) DOM.vhActiveAuthor.textContent = activeVer.author || 'Ban Quản Trị';
  if (DOM.vhActiveReason) DOM.vhActiveReason.textContent = activeVer.reason || 'Phiên bản mới nhất đang áp dụng chính thức cho toàn bộ công trình.';

  const directActiveDownload = getDriveDownloadUrl(activeVer.driveUrl || doc.driveUrl);
  if (DOM.vhActiveDownloadBtn) DOM.vhActiveDownloadBtn.href = directActiveDownload;
  if (DOM.vhActivePreviewBtn) {
    DOM.vhActivePreviewBtn.onclick = () => {
      closeVersionHistoryModal();
      openPreviewModal(doc);
    };
  }

  // Populate Count
  if (DOM.vhRevisionsCount) {
    DOM.vhRevisionsCount.textContent = historyList.length;
  }

  // Render Timeline
  if (DOM.vhTimelineContainer) {
    DOM.vhTimelineContainer.innerHTML = historyList.map(item => {
      const isActive = item.status === 'active';
      const nodeClass = isActive ? 'is-active' : 'is-archived';
      const statusPill = isActive
        ? `<span class="active-status-pill"><i data-lucide="check-circle-2" style="width: 12px; height: 12px;"></i> Đang hiệu lực</span>`
        : `<span class="archived-status-pill"><i data-lucide="archive" style="width: 12px; height: 12px;"></i> Đã thay thế (Lưu trữ)</span>`;

      const dateDisplay = isActive
        ? `<span>Ban hành: <strong>${formatDate(item.releaseDate)}</strong> (Hiện hành)</span>`
        : `<span>Hiệu lực: <strong>${formatDate(item.releaseDate)}</strong> ➔ <strong>${item.deprecatedDate && item.deprecatedDate !== 'Đang áp dụng' ? formatDate(item.deprecatedDate) : 'Hết hiệu lực'}</strong></span>`;

      const itemDownloadUrl = getDriveDownloadUrl(item.driveUrl || doc.driveUrl);

      let actionHtml = '';
      if (!isActive) {
        actionHtml = `
          <div class="timeline-card-actions">
            <span class="tca-warning-hint">
              <i data-lucide="alert-triangle" style="width: 14px; height: 14px;"></i>
              Bản lưu trữ lịch sử - Chỉ dùng tra cứu đối soát, không áp dụng thi công mới
            </span>
            <div class="tca-buttons">
              <a href="${item.driveUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn-old-preview" title="Xem file lưu trữ trên Google Drive">
                <i data-lucide="external-link" style="width: 12px; height: 12px;"></i>
                <span>Xem bản cũ</span>
              </a>
              <a href="${itemDownloadUrl}" target="_blank" rel="noopener noreferrer" class="btn-old-download" title="Tải file bản cũ về máy để đối soát">
                <i data-lucide="download" style="width: 12px; height: 12px;"></i>
                <span>Tải bản cũ</span>
              </a>
            </div>
          </div>
        `;
      } else {
        actionHtml = `
          <div class="timeline-card-actions">
            <span class="active-status-pill">
              <i data-lucide="sparkles" style="width: 13px; height: 13px;"></i>
              Bản chuẩn mực đang ban hành
            </span>
            <div class="tca-buttons">
              <a href="${itemDownloadUrl}" target="_blank" rel="noopener noreferrer" class="btn-old-download" style="background: rgba(16,185,129,0.12); color: #059669; border-color: rgba(16,185,129,0.3);" title="Tải trực tiếp bản mới nhất">
                <i data-lucide="download" style="width: 12px; height: 12px;"></i>
                <span>Tải bản này</span>
              </a>
            </div>
          </div>
        `;
      }

      return `
        <div class="timeline-item-node ${nodeClass}">
          <div class="timeline-node-dot">
            <i data-lucide="${isActive ? 'check' : 'clock'}"></i>
          </div>
          <div class="timeline-card">
            <div class="timeline-card-header">
              <div class="tch-left">
                <span class="ver-tag-pill">${escapeHtml(item.version)}</span>
                ${statusPill}
              </div>
              <div class="timeline-date-range">
                <i data-lucide="calendar" style="width: 13px; height: 13px;"></i>
                ${dateDisplay}
              </div>
            </div>

            <div class="timeline-meta-author">
              <i data-lucide="user-check" style="width: 13px; height: 13px;"></i>
              <span>Người lập / Phê duyệt: <strong>${escapeHtml(item.author || 'Ban Quản Trị')}</strong></span>
            </div>

            <div class="timeline-reason-callout">
              <div class="trc-label">Lý do thay đổi / Nội dung cập nhật:</div>
              <p class="trc-text">${escapeHtml(item.reason || 'Cập nhật phiên bản theo quy chuẩn quản trị chất lượng.')}</p>
              ${item.notes ? `<div class="trc-notes">Ghi chú: ${escapeHtml(item.notes)}</div>` : ''}
            </div>

            ${actionHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  DOM.modalVersionHistory.classList.remove('hidden');
  initLucideIcons();
}

function closeVersionHistoryModal() {
  if (DOM.modalVersionHistory) {
    DOM.modalVersionHistory.classList.add('hidden');
  }
}

function downloadVersionHistorySampleCsv() {
  const csvContent = 
`Mã tài liệu,Phiên bản,Ngày ban hành,Ngày hết hiệu lực,Trạng thái,Người cập nhật / Phê duyệt,Lý do thay đổi / Nội dung cập nhật,Link Google Drive bản cũ,Ghi chú
QT-TK-01,v3.2,2026-10-10,Đang áp dụng,Đang hiệu lực,Ban Giám Đốc,"Cập nhật quy trình duyệt phối cảnh 3D bằng kính VR và chuẩn hóa các mốc nghiệm thu concept với Chủ đầu tư.",https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing,Bắt buộc áp dụng cho toàn bộ dự án từ Q4/2026
QT-TK-01,v3.1,2026-05-15,2026-10-10,Đã thay thế,Trưởng phòng Thiết Kế,"Bổ sung bước lập bảng Moodboard vật liệu & màu sắc thực tế trước khi lên 3D chi tiết để giảm thời gian chỉnh sửa.",https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing,Thay thế cho bản v3.0
QT-TK-01,v3.0,2026-01-10,2026-05-15,Đã thay thế,Ban Giám Đốc,"Nâng cấp toàn diện quy trình thiết kế tích hợp mô hình BIM/Revit đồng bộ hóa dữ liệu trực tiếp với xưởng sản xuất.",https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing,Chuyển đổi công nghệ vẽ CAD sang Revit
QT-TK-01,v2.0,2025-06-20,2026-01-10,Đã thay thế,P. Thiết Kế,"Chuẩn hóa quy trình thiết kế 2D/3D phân tách rõ 2 giai đoạn: Phương án sơ phác và Hồ sơ triển khai thi công chi tiết.",https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing,Lưu trữ đối soát hồ sơ dự án 2025
QT-TK-01,v1.0,2024-03-15,2025-06-20,Đã thay thế,Giám Đốc Sáng Lập,"Ban hành lần đầu quy trình thiết kế cơ sở nội bộ cho H-Design.",https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing,Phiên bản sơ khai ban đầu
QC-BV-02,v2.0,2026-09-25,Đang áp dụng,Đang hiệu lực,P. Kỹ Thuật,"Chuẩn hóa hệ thống Family Revit file mẫu in CTB theo tiêu chuẩn TCVN 2026 và tích hợp mã QR truy xuất bản vẽ hiện trường.",https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing,Áp dụng cho toàn bộ KTS và Họa viên
QC-BV-02,v1.5,2026-03-10,2026-09-25,Đã thay thế,P. Thiết Kế,"Thống nhất quy cách đóng khung tên bản vẽ chuẩn khổ A3/A1 và quy tắc đánh số thứ tự chi tiết kiến trúc.",https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing,Hết hiệu lực từ 25/09/2026
QC-BV-02,v1.0,2025-01-15,2026-03-10,Đã thay thế,P. Thiết Kế,"Ban hành quy chuẩn nét vẽ font chữ và layer AutoCAD dùng chung.",https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing,Lưu trữ hồ sơ cũ
HD-SX-01,v2.5,2026-10-05,Đang áp dụng,Đang hiệu lực,Quản Đốc Phân Xưởng,"Bổ sung quy định kiểm tra độ bám keo PUR chịu nước và checklist kiểm tra độ mòn dao cắt CNC sau 80 giờ chạy liên tục.",https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing,Nghiêm cấm bỏ qua checklist dao cắt
HD-SX-01,v2.0,2026-04-12,2026-10-05,Đã thay thế,Quản Đốc Xưởng,"Bổ sung chỉ dẫn an toàn vận hành máy dán cạnh tự động 8 chức năng mới nhập khẩu và quy cách cắt phôi gỗ melamine.",https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing,Thay thế khi xưởng đầu tư máy mới
HD-SX-01,v1.0,2025-08-01,2026-04-12,Đã thay thế,Bộ phận Sản Xuất,"Ban hành quy trình thao tác máy CNC nesting ban đầu của xưởng gỗ H-Design.",https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing,Bản đầu tiên
QC-AT-01,v3.0,2026-07-20,Đang áp dụng,Đang hiệu lực,Ban Giám Đốc & P. Sản Xuất,"Cập nhật tiêu chuẩn PCCC mới theo Nghị định 50/2024/NĐ-CP và hướng dẫn vận hành hệ thống hút bụi trung tâm phân xưởng.",https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing,Bắt buộc 100% công nhân xưởng học định kỳ
QC-AT-01,v2.0,2025-11-15,2026-07-20,Đã thay thế,P. Sản Xuất,"Quy chuẩn trang bị đồ bảo hộ cá nhân (kính, nút tai, khẩu trang hoạt tính) và quy định khu lưu trữ sơn PU/hóa chất chống cháy.",https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing,Đã nâng cấp lên v3.0
QC-AT-01,v1.0,2024-09-01,2025-11-15,Đã thay thế,Ban Quản Lý,"Quy định an toàn lao động và vệ sinh công nghiệp sơ khai khi mới thành lập xưởng.",https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing,Bản lưu trữ lịch sử`;

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'ProcessHub_Template_LichSuPhienBan.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Đã tải xuống file CSV mẫu Lịch Sử Phiên Bản (Tab 2)', 'success');
}

/**
 * Generate & Download CSV Template for Tab 4: TaiKhoan & PhanQuyen
 */
function downloadUsersSampleCsv() {
  const csvContent = 
`Tên đăng nhập (ID),Mật khẩu (Pass / PIN),Họ và tên hiển thị,Phòng ban chính,Vai trò (Role),Quyền xem bộ phận (Allowed),Ghi chú
admin,1612,Ban Giám Đốc,Ban Giám Đốc,Admin,*,Toàn quyền quản trị & xem tất cả 5 bộ phận
kythuat,1612,Kỹ Sư Hoàng (Kỹ Thuật),Bộ phận Kỹ Thuật,User,"Bộ phận Kỹ Thuật, Bộ phận Sản Xuất",Xem hồ sơ Kỹ Thuật & Sản Xuất
sanxuat,1612,Quản Đốc Nam (Sản Xuất),Bộ phận Sản Xuất,User,"Bộ phận Sản Xuất, Bộ phận Kỹ Thuật",Xem hồ sơ Sản Xuất & Kỹ Thuật
kinhdoanh,1612,Sale Mai (Kinh Doanh),Bộ phận Kinh Doanh,User,"Bộ phận Kinh Doanh, Bộ phận Kỹ Thuật",Xem hồ sơ Kinh Doanh & Kỹ Thuật
hcns,1612,HR Lan (Hành Chính - NS),Hành Chính - Nhân Sự,User,Hành Chính - Nhân Sự,Chỉ xem phòng Hành Chính - Nhân Sự`;

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'ProcessHub_Template_Tab4_TaiKhoan_PhanQuyen.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Đã tải xuống file CSV mẫu Tài Khoản & Phân Quyền (Tab 4)', 'success');
}

async function downloadAppsScriptFile() {
  try {
    const res = await fetch('Google_Apps_Script_ProcessHub.js');
    if (!res.ok) throw new Error('File not found');
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/javascript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Google_Apps_Script_ProcessHub.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Đã tải file mã nguồn Google Apps Script!', 'success');
  } catch (e) {
    showToast('Vui lòng mở file Google_Apps_Script_ProcessHub.js trong thư mục để sao chép mã.', 'info');
  }
}

/**
 * Helper: Multi-link builder for Add and Edit Document Modals
 */
function renderDocLinksBuilder(containerEl, initialLinks = []) {
  if (!containerEl) return;
  const links = (Array.isArray(initialLinks) && initialLinks.length > 0)
    ? initialLinks
    : [{ name: 'Tài liệu chính', url: '' }];

  let html = '';
  links.forEach((l, idx) => {
    const isFirst = idx === 0;
    const defaultPlaceholder = isFirst ? 'Tài liệu chính' : 'VD: Biểu mẫu BM-01, Checklist...';
    html += `
      <div class="doc-link-builder-row">
        <div class="link-name-input-group">
          <input type="text" class="form-input link-item-name" placeholder="${defaultPlaceholder}" value="${escapeHtml(l.name || (isFirst ? 'Tài liệu chính' : ''))}">
        </div>
        <div class="link-url-input-group">
          <i data-lucide="link-2" class="input-icon"></i>
          <input type="url" class="form-input link-item-url" placeholder="https://drive.google.com/file/d/..." value="${escapeHtml(l.url || '')}" ${isFirst ? 'required' : ''}>
        </div>
        ${!isFirst ? `
          <button type="button" class="btn-remove-link-row" title="Xóa link này">
            <i data-lucide="trash-2"></i>
          </button>
        ` : `
          <span class="primary-link-tag" title="File / Link chính">#1</span>
        `}
      </div>
    `;
  });

  containerEl.innerHTML = html;

  containerEl.querySelectorAll('.btn-remove-link-row').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const row = btn.closest('.doc-link-builder-row');
      if (row) row.remove();
    });
  });

  initLucideIcons();
}

function addLinkRowToBuilder(containerEl) {
  if (!containerEl) return;
  const rowCount = containerEl.querySelectorAll('.doc-link-builder-row').length + 1;
  const div = document.createElement('div');
  div.className = 'doc-link-builder-row';
  div.innerHTML = `
    <div class="link-name-input-group">
      <input type="text" class="form-input link-item-name" placeholder="VD: Biểu mẫu 0${rowCount}, Checklist..." value="">
    </div>
    <div class="link-url-input-group">
      <i data-lucide="link-2" class="input-icon"></i>
      <input type="url" class="form-input link-item-url" placeholder="https://drive.google.com/file/d/..." value="" required>
    </div>
    <button type="button" class="btn-remove-link-row" title="Xóa link này">
      <i data-lucide="trash-2"></i>
    </button>
  `;

  div.querySelector('.btn-remove-link-row').addEventListener('click', (e) => {
    e.preventDefault();
    div.remove();
  });

  containerEl.appendChild(div);
  initLucideIcons();

  const urlInput = div.querySelector('.link-item-url');
  if (urlInput) urlInput.focus();
}

function getLinksFromContainer(containerEl) {
  if (!containerEl) return [];
  const rows = containerEl.querySelectorAll('.doc-link-builder-row');
  const links = [];
  rows.forEach((row, idx) => {
    const nameInput = row.querySelector('.link-item-name');
    const urlInput = row.querySelector('.link-item-url');
    const name = nameInput ? nameInput.value.trim() : '';
    const url = urlInput ? urlInput.value.trim() : '';
    if (url) {
      links.push({
        name: name || (idx === 0 ? 'Tài liệu chính' : `Tài liệu ${idx + 1}`),
        url
      });
    }
  });
  return links;
}

/**
 * ============================================================
 * ADD NEW DOCUMENT / PROCESS CONTROLLER
 * ============================================================
 */

function openAddDocModal() {
  if (!DOM.modalAddDoc) return;

  // Set default date to today
  if (DOM.addDocDate && !DOM.addDocDate.value) {
    DOM.addDocDate.value = new Date().toISOString().split('T')[0];
  }

  // Suggest code if empty
  if (DOM.addDocCode && !DOM.addDocCode.value.trim()) {
    suggestNextDocCode(true);
  }

  // Initialize links builder
  renderDocLinksBuilder(DOM.addDocLinksContainer, [{ name: 'Tài liệu chính', url: '' }]);

  // Update sync status banner
  const sheetConfig = DataStore.getSheetConfig();
  const sheetId = sheetConfig ? sheetConfig.sheetId : null;

  if (DOM.addDocSyncStatus && DOM.addDocSyncStatusText) {
    if (sheetId && sheetId.includes('script.google.com/macros/s/')) {
      DOM.addDocSyncStatus.className = 'add-doc-sync-banner';
      DOM.addDocSyncStatusText.innerHTML = '<strong>🟢 Đã kết nối Google Apps Script Web App:</strong> Quy trình mới sẽ tự động lưu 1 dòng vào Google Sheet <em>QuyTrinhHienHanh</em>.';
    } else if (sheetId) {
      DOM.addDocSyncStatus.className = 'add-doc-sync-banner warning';
      DOM.addDocSyncStatusText.innerHTML = '<strong>ℹ️ Đang kết nối Google Sheet đọc (CSV):</strong> Quy trình sẽ lưu tức thì trên web app. Để tự động ghi trực tiếp vào Sheet mà không cần mở Sheet, hãy sử dụng Web App URL trong <em>Cài đặt</em>.';
    } else {
      DOM.addDocSyncStatus.className = 'add-doc-sync-banner warning';
      DOM.addDocSyncStatusText.innerHTML = '<strong>💾 Bộ nhớ nội bộ ProcessHub:</strong> Quy trình được lưu trữ trên trình duyệt web. Bạn có thể mở <em>Cài đặt</em> để liên kết Google Sheets dùng chung toàn công ty.';
    }
  }

  DOM.modalAddDoc.classList.remove('hidden');
  initLucideIcons();
  
  if (DOM.addDocTitle) {
    setTimeout(() => DOM.addDocTitle.focus(), 100);
  }
}

function closeAddDocModal() {
  if (!DOM.modalAddDoc) return;
  DOM.modalAddDoc.classList.add('hidden');
  if (DOM.formAddDoc) {
    DOM.formAddDoc.reset();
  }
  // Reset submit button state
  if (DOM.btnSubmitAddDoc) {
    DOM.btnSubmitAddDoc.disabled = false;
  }
  if (DOM.submitAddText) {
    DOM.submitAddText.textContent = 'Lưu & Xuất Bản Quy Trình';
  }
  if (DOM.submitAddIcon) {
    DOM.submitAddIcon.setAttribute('data-lucide', 'plus-circle');
    initLucideIcons();
  }
}

function suggestNextDocCode(force = true) {
  if (!DOM.addDocCode) return;
  const currentVal = DOM.addDocCode.value.trim();
  // If user entered a custom code format and this is just an auto-trigger on dept/cat change, keep it
  if (!force && currentVal && !currentVal.match(/^[A-Z]{2}-[A-Z]{2}-\d+$/)) {
    return;
  }

  const dept = DOM.addDocDept ? DOM.addDocDept.value : 'Bộ phận Kỹ Thuật';
  const cat = DOM.addDocCat ? DOM.addDocCat.value : 'Quy trình';

  // Category prefix
  let catPrefix = 'QT';
  if (cat.includes('chuẩn')) catPrefix = 'QC';
  else if (cat.includes('dẫn')) catPrefix = 'HD';
  else if (cat.includes('mẫu')) catPrefix = 'BM';
  else if (cat.includes('sách') || cat.includes('chế')) catPrefix = 'CS';

  // Department prefix
  let deptPrefix = 'TK';
  if (dept.includes('Thuật')) deptPrefix = 'KT';
  else if (dept.includes('Công')) deptPrefix = 'TC';
  else if (dept.includes('Xuất')) deptPrefix = 'SX';
  else if (dept.includes('Giám Đốc')) deptPrefix = 'GD';

  const prefix = `${catPrefix}-${deptPrefix}-`;

  // Search existing documents in AppState.allDocuments
  let maxIndex = 0;
  AppState.allDocuments.forEach(d => {
    const code = (d.code || '').trim().toUpperCase();
    if (code.startsWith(prefix)) {
      const numPart = parseInt(code.substring(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxIndex) {
        maxIndex = numPart;
      }
    }
  });

  const nextIndex = maxIndex + 1;
  const suggestedCode = `${prefix}${String(nextIndex).padStart(2, '0')}`;
  DOM.addDocCode.value = suggestedCode;
}

async function handleAddDocSubmit(e) {
  if (e) e.preventDefault();

  const code = (DOM.addDocCode ? DOM.addDocCode.value : '').trim().toUpperCase();
  const title = (DOM.addDocTitle ? DOM.addDocTitle.value : '').trim();
  const department = DOM.addDocDept ? DOM.addDocDept.value : 'Bộ phận Kỹ Thuật';
  const category = DOM.addDocCat ? DOM.addDocCat.value : 'Quy trình';
  const version = (DOM.addDocVersion ? DOM.addDocVersion.value : '').trim() || 'v1.0';
  const updatedAt = (DOM.addDocDate ? DOM.addDocDate.value : '') || new Date().toISOString().split('T')[0];
  const description = (DOM.addDocDesc ? DOM.addDocDesc.value : '').trim();
  const rawTags = (DOM.addDocTags ? DOM.addDocTags.value : '').trim();

  // Extract links from dynamic builder
  const links = getLinksFromContainer(DOM.addDocLinksContainer);
  if (links.length === 0) {
    showToast('Vui lòng nhập ít nhất 1 link Google Drive hợp lệ (*)', 'warning');
    return;
  }
  const driveUrl = serializeDocumentLinks(links);

  if (!code || !title || !driveUrl) {
    showToast('Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'warning');
    return;
  }

  // Parse tags
  const tags = rawTags
    ? rawTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
    : [category.toLowerCase(), department.toLowerCase()];

  // Check code uniqueness
  const existingDoc = AppState.allDocuments.find(d => (d.code || '').trim().toUpperCase() === code);
  if (existingDoc) {
    showToast(`Mã [${code}] đã tồn tại ("${existingDoc.title}"). Vui lòng chọn mã khác hoặc bấm "Gợi ý mã"!`, 'warning');
    if (DOM.addDocCode) DOM.addDocCode.focus();
    return;
  }

  const newDoc = {
    id: `doc-${Date.now()}`,
    code,
    title,
    department,
    category,
    version,
    updatedAt,
    driveUrl,
    description,
    tags
  };

  // Set loading UI on submit button
  if (DOM.btnSubmitAddDoc) DOM.btnSubmitAddDoc.disabled = true;
  if (DOM.submitAddText) DOM.submitAddText.textContent = 'Đang lưu & đồng bộ...';
  if (DOM.submitAddIcon) {
    DOM.submitAddIcon.setAttribute('data-lucide', 'loader-2');
    initLucideIcons();
  }

  try {
    // 1. Add to DataStore (LocalStorage & in-memory)
    DataStore.addDocument(newDoc);
    AppState.allDocuments = DataStore.getDocuments();

    // 2. Attempt sync to Google Apps Script Web App
    const syncResult = await DataStore.syncDocumentToGoogleSheet(newDoc);

    // 3. Update UI
    populateDepartmentOptions();
    applyFiltersAndRender();

    // 4. Close modal
    closeAddDocModal();

    // 5. Notify user
    if (syncResult && syncResult.synced) {
      showToast(`🎉 Đã thêm thành công [${newDoc.code}] và tự động ghi vào Google Sheet!`, 'success');
    } else {
      showToast(`✅ Đã thêm quy trình [${newDoc.code}] vào ProcessHub!`, 'success');
    }

    // Scroll to the documents section
    const targetElement = DOM.documentsTableWrapper || DOM.documentsGrid;
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  } catch (err) {
    console.error('Lỗi khi thêm quy trình:', err);
    showToast(`Có lỗi xảy ra: ${err.message}`, 'error');
    if (DOM.btnSubmitAddDoc) DOM.btnSubmitAddDoc.disabled = false;
    if (DOM.submitAddText) DOM.submitAddText.textContent = 'Lưu & Xuất Bản Quy Trình';
    if (DOM.submitAddIcon) {
      DOM.submitAddIcon.setAttribute('data-lucide', 'plus-circle');
      initLucideIcons();
    }
  }
}

/**
 * ============================================================
 * EDIT DOCUMENT / UPDATE GOOGLE DRIVE LINK CONTROLLER
 * ============================================================
 */

function openEditDocModal(docId) {
  if (!DOM.modalEditDoc) return;

  const doc = AppState.allDocuments.find(d => d.id === docId || d.code === docId);
  if (!doc) {
    showToast('Không tìm thấy tài liệu cần chỉnh sửa.', 'error');
    return;
  }

  // Pre-fill form fields
  if (DOM.editDocId) DOM.editDocId.value = doc.id;
  if (DOM.editDocCode) DOM.editDocCode.value = doc.code || '';
  if (DOM.editDocTitle) DOM.editDocTitle.value = doc.title || '';
  if (DOM.editDocDept) DOM.editDocDept.value = doc.department || 'Bộ phận Kỹ Thuật';
  if (DOM.editDocCat) DOM.editDocCat.value = doc.category || 'Quy trình';
  if (DOM.editDocVersion) DOM.editDocVersion.value = doc.version || 'v1.0';
  if (DOM.editDocDate) DOM.editDocDate.value = new Date().toISOString().split('T')[0];
  if (DOM.editDocUrl) DOM.editDocUrl.value = doc.driveUrl || '';
  if (DOM.editDocReason) DOM.editDocReason.value = '';
  if (DOM.editDocDesc) DOM.editDocDesc.value = doc.description || '';
  if (DOM.editDocTags) DOM.editDocTags.value = Array.isArray(doc.tags) ? doc.tags.join(', ') : (doc.tags || '');

  // Render multi-link builder with existing links
  const currentLinks = parseDocumentLinks(doc);
  renderDocLinksBuilder(DOM.editDocLinksContainer, currentLinks);

  // Check sync status
  const sheetConfig = DataStore.getSheetConfig();
  const sheetId = sheetConfig ? sheetConfig.sheetId : null;
  if (DOM.editDocSyncStatus && DOM.editDocSyncStatusText) {
    if (sheetId && sheetId.includes('script.google.com/macros/s/')) {
      DOM.editDocSyncStatus.className = 'add-doc-sync-banner';
      DOM.editDocSyncStatusText.innerHTML = '<strong>🟢 Đã kết nối Google Apps Script Web App:</strong> Link mới sẽ tự động cập nhật vào Google Sheet <em>QuyTrinhHienHanh</em> và lưu bản cũ vào <em>LichSuPhienBan</em>.';
    } else if (sheetId) {
      DOM.editDocSyncStatus.className = 'add-doc-sync-banner warning';
      DOM.editDocSyncStatusText.innerHTML = '<strong>ℹ️ Đang kết nối Google Sheet đọc (CSV):</strong> Cập nhật sẽ lưu trên web app. Để tự động ghi trực tiếp vào Google Sheet hai chiều, hãy dùng Web App URL trong <em>Cài đặt</em>.';
    } else {
      DOM.editDocSyncStatus.className = 'add-doc-sync-banner warning';
      DOM.editDocSyncStatusText.innerHTML = '<strong>💾 Bộ nhớ nội bộ ProcessHub:</strong> Link mới sẽ được lưu trực tiếp trên trình duyệt. Bạn có thể mở <em>Cài đặt</em> để kết nối Google Sheets.';
    }
  }

  DOM.modalEditDoc.classList.remove('hidden');
  initLucideIcons();
}

function closeEditDocModal() {
  if (!DOM.modalEditDoc) return;
  DOM.modalEditDoc.classList.add('hidden');
  if (DOM.formEditDoc) {
    DOM.formEditDoc.reset();
  }
  if (DOM.btnSubmitEditDoc) {
    DOM.btnSubmitEditDoc.disabled = false;
  }
  if (DOM.submitEditText) {
    DOM.submitEditText.textContent = 'Lưu Cập Nhật & Đồng Bộ';
  }
  if (DOM.submitEditIcon) {
    DOM.submitEditIcon.setAttribute('data-lucide', 'save');
    initLucideIcons();
  }
}

async function handleEditDocSubmit(e) {
  if (e) e.preventDefault();

  const id = (DOM.editDocId ? DOM.editDocId.value : '').trim();
  const code = (DOM.editDocCode ? DOM.editDocCode.value : '').trim().toUpperCase();
  const title = (DOM.editDocTitle ? DOM.editDocTitle.value : '').trim();
  const department = DOM.editDocDept ? DOM.editDocDept.value : 'Bộ phận Kỹ Thuật';
  const category = DOM.editDocCat ? DOM.editDocCat.value : 'Quy trình';
  const version = (DOM.editDocVersion ? DOM.editDocVersion.value : '').trim() || 'v1.0';
  const updatedAt = (DOM.editDocDate ? DOM.editDocDate.value : '') || new Date().toISOString().split('T')[0];
  const changeReason = (DOM.editDocReason ? DOM.editDocReason.value : '').trim();
  const description = (DOM.editDocDesc ? DOM.editDocDesc.value : '').trim();
  const rawTags = (DOM.editDocTags ? DOM.editDocTags.value : '').trim();

  // Extract links from dynamic builder
  const links = getLinksFromContainer(DOM.editDocLinksContainer);
  if (links.length === 0) {
    showToast('Vui lòng nhập ít nhất 1 link Google Drive hợp lệ (*)', 'warning');
    return;
  }
  const driveUrl = serializeDocumentLinks(links);

  if (!code || !title || !driveUrl) {
    showToast('Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'warning');
    return;
  }

  const tags = rawTags
    ? rawTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
    : [category.toLowerCase(), department.toLowerCase()];

  const updatedDoc = {
    id: id || `doc-${Date.now()}`,
    code,
    title,
    department,
    category,
    version,
    updatedAt,
    driveUrl,
    description,
    tags
  };

  if (DOM.btnSubmitEditDoc) DOM.btnSubmitEditDoc.disabled = true;
  if (DOM.submitEditText) DOM.submitEditText.textContent = 'Đang lưu & đồng bộ...';
  if (DOM.submitEditIcon) {
    DOM.submitEditIcon.setAttribute('data-lucide', 'loader-2');
    initLucideIcons();
  }

  try {
    const authorName = AppState.currentUser ? AppState.currentUser.name : (department || 'Ban Quản Trị');
    
    // 1. Update in DataStore
    DataStore.updateDocument(updatedDoc, changeReason, authorName);
    AppState.allDocuments = DataStore.getDocuments();

    // 2. Sync to Google Apps Script Web App
    const syncResult = await DataStore.syncUpdateToGoogleSheet(updatedDoc, changeReason, authorName);

    // 3. Re-render UI
    populateDepartmentOptions();
    applyFiltersAndRender();

    // 4. Close modal
    closeEditDocModal();

    // 5. Notify user
    if (syncResult && syncResult.synced) {
      showToast(`🎉 Đã cập nhật thành công [${updatedDoc.code}] và tự động ghi vào Google Sheet!`, 'success');
    } else {
      showToast(`✅ Đã cập nhật link Google Drive cho quy trình [${updatedDoc.code}]!`, 'success');
    }

  } catch (err) {
    console.error('Lỗi khi cập nhật quy trình:', err);
    showToast(`Có lỗi xảy ra: ${err.message}`, 'error');
    if (DOM.btnSubmitEditDoc) DOM.btnSubmitEditDoc.disabled = false;
    if (DOM.submitEditText) DOM.submitEditText.textContent = 'Lưu Cập Nhật & Đồng Bộ';
    if (DOM.submitEditIcon) {
      DOM.submitEditIcon.setAttribute('data-lucide', 'save');
      initLucideIcons();
    }
  }
}

/**
 * ==============================================================================
 * DELETE DOCUMENT CONTROLLERS (ADMIN ONLY)
 * ==============================================================================
 */
let pendingDeleteDoc = null;

function openDeleteConfirmModal(doc) {
  if (!doc) return;
  if (!AuthStore.isAdmin(AppState.currentUser)) {
    showToast('Chỉ tài khoản Quản trị (Ban Giám Đốc) mới có quyền xóa tài liệu!', 'warning');
    return;
  }

  pendingDeleteDoc = doc;

  if (DOM.delDocCode) DOM.delDocCode.textContent = doc.code || 'DOC';
  if (DOM.delDocTitle) DOM.delDocTitle.textContent = doc.title || '';
  if (DOM.delDocDesc) DOM.delDocDesc.textContent = doc.description || 'Chưa có mô tả tóm tắt.';
  if (DOM.delDocCategory) {
    DOM.delDocCategory.textContent = doc.category || 'Quy trình';
    DOM.delDocCategory.className = `cat-badge ${getCategoryClass(doc.category)}`;
  }
  if (DOM.delDocDept) {
    DOM.delDocDept.textContent = doc.department || '';
  }

  if (DOM.confirmDeleteText) DOM.confirmDeleteText.textContent = 'Xác Nhận Xóa';
  if (DOM.btnConfirmDelete) DOM.btnConfirmDelete.disabled = false;

  if (DOM.modalDeleteConfirm) {
    DOM.modalDeleteConfirm.classList.remove('hidden');
    initLucideIcons();
  }
}

function closeDeleteConfirmModal() {
  pendingDeleteDoc = null;
  if (DOM.modalDeleteConfirm) {
    DOM.modalDeleteConfirm.classList.add('hidden');
  }
}

async function handleExecuteDelete() {
  if (!pendingDeleteDoc) return;
  if (!AuthStore.isAdmin(AppState.currentUser)) {
    showToast('Bạn không có quyền thực hiện thao tác này!', 'warning');
    closeDeleteConfirmModal();
    return;
  }

  const docToDelete = pendingDeleteDoc;
  const docCode = docToDelete.code || '';
  const docId = docToDelete.id;

  // Show loading state
  if (DOM.btnConfirmDelete) DOM.btnConfirmDelete.disabled = true;
  if (DOM.confirmDeleteText) DOM.confirmDeleteText.textContent = 'Đang xóa...';

  try {
    // 1. Delete from DataStore (LocalStorage & in-memory)
    DataStore.deleteDocument(docId, docCode);

    // 2. Update AppState
    AppState.allDocuments = AppState.allDocuments.filter(d => 
      d.id !== docId && (d.code || '').trim().toUpperCase() !== docCode.trim().toUpperCase()
    );

    // 3. Close modals
    closeDeleteConfirmModal();

    if (DOM.modalPreview && !DOM.modalPreview.classList.contains('hidden') && AppState.activePreviewDoc && AppState.activePreviewDoc.id === docId) {
      closePreviewModal();
    }

    // 4. Re-render UI
    populateDepartmentOptions();
    applyFiltersAndRender();

    showToast(`Đã xóa quy trình [${docCode}] khỏi hệ thống!`, 'success');

    // 5. Send delete sync to Google Sheets (Web App)
    const syncRes = await DataStore.syncDeleteToGoogleSheet(docToDelete);
    if (syncRes && syncRes.isWebApp) {
      if (syncRes.synced) {
        showToast(syncRes.message || `Đã đồng bộ xóa [${docCode}] trên Google Sheet!`, 'success');
      } else {
        showToast(syncRes.message, 'warning');
      }
    }

  } catch (err) {
    console.error('Lỗi khi xóa tài liệu:', err);
    showToast(`Lỗi khi xóa tài liệu: ${err.message}`, 'error');
  } finally {
    if (DOM.btnConfirmDelete) DOM.btnConfirmDelete.disabled = false;
    if (DOM.confirmDeleteText) DOM.confirmDeleteText.textContent = 'Xác Nhận Xóa';
  }
}





