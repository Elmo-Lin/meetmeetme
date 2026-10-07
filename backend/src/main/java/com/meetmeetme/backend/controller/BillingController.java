package com.meetmeetme.backend.controller;

import com.meetmeetme.backend.config.AuthInterceptor;
import com.meetmeetme.backend.model.CheckoutRequest;
import com.meetmeetme.backend.model.Membership;
import com.meetmeetme.backend.service.MembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private MembershipService membershipService;

    // 購買方案：TRIAL（7 天試用）、MONTHLY、QUARTERLY；目前為模擬付款
    @PostMapping("/checkout")
    public Membership checkout(@RequestBody CheckoutRequest req,
                               @RequestAttribute(name = AuthInterceptor.MEMBER_ID, required = false) String me) {
        return membershipService.checkout(req.getPlan(), me);
    }
}
