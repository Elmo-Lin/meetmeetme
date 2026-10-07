package com.meetmeetme.backend.model;

import java.util.List;

// 編輯個人資料；身分與財力認證不能自己改
public class ProfileRequest {
    private String nickname;
    private String city;
    private String job;
    private Integer heightCm;
    private String education;
    private String budget;
    private String frequency;
    private List<String> relationshipTypes;
    private List<String> tags;
    private String intro;
    private String expectation;

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getJob() { return job; }
    public void setJob(String job) { this.job = job; }

    public Integer getHeightCm() { return heightCm; }
    public void setHeightCm(Integer heightCm) { this.heightCm = heightCm; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public List<String> getRelationshipTypes() { return relationshipTypes; }
    public void setRelationshipTypes(List<String> relationshipTypes) { this.relationshipTypes = relationshipTypes; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getIntro() { return intro; }
    public void setIntro(String intro) { this.intro = intro; }

    public String getExpectation() { return expectation; }
    public void setExpectation(String expectation) { this.expectation = expectation; }
}
