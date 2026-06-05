#include <algorithm>
#include <cmath>

extern "C" {

double score_service(
    double latency_ms,
    double error_rate,
    double cpu_percent,
    double memory_percent,
    double packet_loss_percent,
    double stale_minutes
) {
    const double latency_penalty = std::min(32.0, std::max(0.0, (latency_ms - 120.0) / 18.0));
    const double error_penalty = std::min(30.0, error_rate * 2.4);
    const double cpu_penalty = cpu_percent > 72.0 ? (cpu_percent - 72.0) * 0.45 : 0.0;
    const double memory_penalty = memory_percent > 78.0 ? (memory_percent - 78.0) * 0.38 : 0.0;
    const double packet_penalty = packet_loss_percent * 3.2;
    const double stale_penalty = stale_minutes > 5.0 ? (stale_minutes - 5.0) * 1.8 : 0.0;

    const double score = 100.0 - latency_penalty - error_penalty - cpu_penalty
        - memory_penalty - packet_penalty - stale_penalty;

    return std::clamp(score, 0.0, 100.0);
}

int incident_level(
    double latency_ms,
    double error_rate,
    double cpu_percent,
    double memory_percent,
    double packet_loss_percent,
    double stale_minutes
) {
    const double score = score_service(
        latency_ms,
        error_rate,
        cpu_percent,
        memory_percent,
        packet_loss_percent,
        stale_minutes
    );

    if (score < 58.0 || error_rate >= 9.5 || packet_loss_percent >= 6.0) {
        return 2;
    }

    if (score < 78.0 || latency_ms >= 420.0 || cpu_percent >= 88.0 || memory_percent >= 90.0) {
        return 1;
    }

    return 0;
}

double risk_index(
    double current_score,
    double previous_score,
    double incidents_24h,
    double deploy_age_hours
) {
    const double downward_trend = std::max(0.0, previous_score - current_score);
    const double recency_factor = deploy_age_hours < 12.0 ? (12.0 - deploy_age_hours) * 1.7 : 0.0;
    const double incident_factor = std::min(28.0, incidents_24h * 4.0);
    const double risk = downward_trend * 1.6 + recency_factor + incident_factor + (100.0 - current_score) * 0.45;

    return std::clamp(risk, 0.0, 100.0);
}

}
