package com.meetmeetme.backend.model;

import java.time.LocalDate;
import java.util.List;

public class SignupRequest {
    private String email;
    private String password;
    private String role;
    private String nickname;
    private LocalDate birthDate;
    private String city;
    private String budget;
    private String frequency;
    private List<String> relationshipTypes;
    private Boolean acceptTerms;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public List<String> getRelationshipTypes() { return relationshipTypes; }
    public void setRelationshipTypes(List<String> relationshipTypes) { this.relationshipTypes = relationshipTypes; }

    public Boolean getAcceptTerms() { return acceptTerms; }
    public void setAcceptTerms(Boolean acceptTerms) { this.acceptTerms = acceptTerms; }
}
