package com.civicconnect.repository;

import com.civicconnect.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    @Query("SELECT ub FROM UserBadge ub WHERE ub.user.id = :userId ORDER BY ub.awardedAt DESC")
    List<UserBadge> findByUserIdOrderByAwardedAtDesc(@Param("userId") Long userId);

    @Query("SELECT ub FROM UserBadge ub WHERE ub.user.id = :userId AND ub.badge.id = :badgeId")
    Optional<UserBadge> findByUserIdAndBadgeId(@Param("userId") Long userId, @Param("badgeId") Long badgeId);

    @Query("SELECT CASE WHEN COUNT(ub) > 0 THEN TRUE ELSE FALSE END FROM UserBadge ub WHERE ub.user.id = :userId AND ub.badge.id = :badgeId")
    boolean existsByUserIdAndBadgeId(@Param("userId") Long userId, @Param("badgeId") Long badgeId);

    @Query("SELECT COUNT(ub) FROM UserBadge ub WHERE ub.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
