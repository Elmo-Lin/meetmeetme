package com.meetmeetme.backend.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// 與前端 src/data/options.js 對應的合法選項
// 用 HashSet 而不是 Set.of：Set.of 的 contains(null) 會丟例外，請求少欄位時會變成 500
final class Options {

    static final Set<String> ROLES = of("BABY", "DADDY");
    static final Set<String> CITIES = of("台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市", "新竹市");
    static final Set<String> BUDGETS = of("b0", "b1", "b2", "b3", "b4");
    static final Set<String> FREQUENCIES = of("每週 1 次", "每週 2–3 次", "每月 2–3 次", "彈性安排");
    static final Set<String> RELATIONSHIP_TYPES = of("長期穩定", "短期體驗", "旅伴", "飯局 / 聊天", "導師型");
    static final Set<String> EDUCATIONS = of("高中", "專科", "大學", "碩士", "博士");
    static final List<String> INCOME_LABELS = Collections.unmodifiableList(Arrays.asList(
        "年收 150 萬以上", "年收 300 萬以上", "年收 500 萬以上", "年收 800 萬以上", "年收 1000 萬以上"));
    static final Set<String> REPORT_REASONS = of("SCAM", "FAKE", "HARASSMENT", "MINOR", "PROSTITUTION", "OTHER");

    // 與前端 Messages.jsx 的提醒字眼一致
    static final Set<String> RISK_WORDS = of("匯款", "轉帳", "儲值", "點數卡", "投資", "保證金", "車馬費", "誠意金", "line", "http");

    private static Set<String> of(String... values) {
        return Collections.unmodifiableSet(new HashSet<>(Arrays.asList(values)));
    }

    private Options() {
    }
}
