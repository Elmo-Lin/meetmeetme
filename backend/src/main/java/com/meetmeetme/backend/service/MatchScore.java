package com.meetmeetme.backend.service;

import com.meetmeetme.backend.model.Member;

import java.util.List;

// 契合度：依預算、見面頻率、關係類型與興趣計算（與前端 mockServer 相同的公式）
final class MatchScore {

    static int of(Member viewer, Member other) {
        int score = 40;
        if (viewer.getBudget().equals(other.getBudget())) score += 20;
        if (viewer.getFrequency().equals(other.getFrequency())) score += 15;
        score += Math.min(overlap(viewer.getRelationshipTypes(), other.getRelationshipTypes()) * 10, 20);
        score += Math.min(overlap(viewer.getTags(), other.getTags()) * 5, 5);
        return Math.min(score, 99);
    }

    private static int overlap(List<String> a, List<String> b) {
        return (int) a.stream().filter(b::contains).count();
    }

    private MatchScore() {
    }
}
