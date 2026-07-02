package com.civicconnect.repository;

import com.civicconnect.entity.EcoPointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EcoPointTransactionRepository extends JpaRepository<EcoPointTransaction, Long> {

    @Query("SELECT t FROM EcoPointTransaction t WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    List<EcoPointTransaction> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(t.points), 0) FROM EcoPointTransaction t WHERE t.user.id = :userId")
    Integer sumPointsByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(t.points), 0) FROM EcoPointTransaction t WHERE t.user.id = :userId AND t.createdAt >= :since")
    Integer sumPointsByUserIdSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(t) FROM EcoPointTransaction t WHERE t.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT t.user.id, SUM(t.points) FROM EcoPointTransaction t WHERE t.createdAt >= :since GROUP BY t.user.id ORDER BY SUM(t.points) DESC")
    List<Object[]> findLeaderboardSince(@Param("since") LocalDateTime since);

    @Query("SELECT t.user.id, SUM(t.points) FROM EcoPointTransaction t GROUP BY t.user.id ORDER BY SUM(t.points) DESC")
    List<Object[]> findLeaderboardAllTime();
}


