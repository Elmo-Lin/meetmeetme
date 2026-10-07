package com.meetmeetme.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;
import java.util.List;

// match：與登入者的契合度，未登入為 null
public class Member {
    private String id;
    private String role;
    private String nickname;
    private Integer age;
    private String city;
    private String job;
    private Integer heightCm;
    private String education;
    private String budget;
    private String frequency;
    private List<String> relationshipTypes;
    private List<String> verified;
    private List<String> photos;
    private List<String> tags;
    private String incomeLabel;
    private String expectation;
    private String intro;
    private Boolean demo;
    private Boolean online;
    private Instant lastActiveAt;
    private Integer match;
    private Boolean liked;
    private String photoVisibility;
    private String photoLock;
    private Integer photoCount;
    private Membership membership;
    @JsonIgnore
    private Boolean likedMe;
    @JsonIgnore
    private Boolean banned;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

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

    public List<String> getVerified() { return verified; }
    public void setVerified(List<String> verified) { this.verified = verified; }

    public List<String> getPhotos() { return photos; }
    public void setPhotos(List<String> photos) { this.photos = photos; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getIncomeLabel() { return incomeLabel; }
    public void setIncomeLabel(String incomeLabel) { this.incomeLabel = incomeLabel; }

    public String getExpectation() { return expectation; }
    public void setExpectation(String expectation) { this.expectation = expectation; }

    public String getIntro() { return intro; }
    public void setIntro(String intro) { this.intro = intro; }

    public Boolean getDemo() { return demo; }
    public void setDemo(Boolean demo) { this.demo = demo; }

    public Boolean getOnline() { return online; }
    public void setOnline(Boolean online) { this.online = online; }

    public Instant getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(Instant lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public Integer getMatch() { return match; }
    public void setMatch(Integer match) { this.match = match; }

    public Boolean getLiked() { return liked; }
    public void setLiked(Boolean liked) { this.liked = liked; }

    public String getPhotoVisibility() { return photoVisibility; }
    public void setPhotoVisibility(String photoVisibility) { this.photoVisibility = photoVisibility; }

    public String getPhotoLock() { return photoLock; }
    public void setPhotoLock(String photoLock) { this.photoLock = photoLock; }

    public Integer getPhotoCount() { return photoCount; }
    public void setPhotoCount(Integer photoCount) { this.photoCount = photoCount; }

    public Membership getMembership() { return membership; }
    public void setMembership(Membership membership) { this.membership = membership; }

    @JsonIgnore
    public Boolean getLikedMe() { return likedMe; }
    public void setLikedMe(Boolean likedMe) { this.likedMe = likedMe; }

    @JsonIgnore
    public Boolean getBanned() { return banned; }
    public void setBanned(Boolean banned) { this.banned = banned; }
}
