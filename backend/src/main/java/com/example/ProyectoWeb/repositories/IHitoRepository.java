package com.example.ProyectoWeb.repositories;

import com.example.ProyectoWeb.entity.Hito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IHitoRepository extends JpaRepository<Hito, Long> {

    @Query("SELECT h FROM Hito h WHERE h.eventoRelacionado.nombre = :nombreEvento")
    List<Hito> findByNombreEvento(@Param("nombreEvento") String nombreEvento);

    @Query("SELECT h FROM Hito h WHERE h.fechaRegistro = :fecha")
    List<Hito> findByFecha(@Param("fecha") String fecha);

    @Query("SELECT h FROM Hito h WHERE h.beneficiario.nombre = :nombreResponsable")
    List<Hito> findByNombreResponsable(@Param("nombreResponsable") String nombreResponsable);

    // Método para buscar hitos por eventoId
    @Query("SELECT h FROM Hito h WHERE h.eventoRelacionado.id = :eventoId")
    List<Hito> findByEventoId(@Param("eventoId") Long eventoId);

    // Agregar este nuevo método para buscar por beneficiario id
    List<Hito> findByBeneficiarioId(Long beneficiarioId);

    // Opcionalmente también puedes definirlo con @Query así:
    // @Query("SELECT h FROM Hito h WHERE h.beneficiario.id = :beneficiarioId")
    // List<Hito> findByBeneficiarioId(@Param("beneficiarioId") Long beneficiarioId);
}
