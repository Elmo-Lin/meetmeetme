package com.meetmeetme.backend.service;

import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * 金流。目前是模擬付款：一律成功、不會真的扣款。
 * 之後接綠界等金流時，改成導向付款頁、在付款結果通知（callback）中再開通訂閱。
 */
public interface PaymentGateway {
    String name();
    /** 扣款成功回傳金流端的交易編號 */
    String charge(long paymentId, String memberId, int amount);
}

@Service
class MockPaymentGateway implements PaymentGateway {

    @Override
    public String name() {
        return "MOCK";
    }

    @Override
    public String charge(long paymentId, String memberId, int amount) {
        return "MOCK-" + UUID.randomUUID();
    }
}
