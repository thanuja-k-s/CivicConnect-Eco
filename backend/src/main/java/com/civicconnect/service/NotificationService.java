package com.civicconnect.service;

import com.civicconnect.entity.Notification;
import com.civicconnect.entity.User;
import com.civicconnect.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(User user, String title, String message, String type, Long referenceId) {
        Notification n = new Notification(user, title, message, type, referenceId);
        return notificationRepository.save(n);
    }

    public Notification createNotification(User user, String title, String message, String type) {
        return createNotification(user, title, message, type, null);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    public void markRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }
}
