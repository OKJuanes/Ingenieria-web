package com.example.ProyectoWeb.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ProyectoWeb.entity.InvitadoExterno;

import java.util.List;
import java.util.Optional;

public interface IInvitadoExternoRepository extends JpaRepository<InvitadoExterno, Long> {

    Optional<InvitadoExterno> findByCorreo(String correo);

    List<InvitadoExterno> findByEmpresa(String empresa);

    @Query("SELECT ie FROM InvitadoExterno ie WHERE ie.nombre = :nombre AND ie.apellido = :apellido")
    List<InvitadoExterno> findByNombreAndApellido(@Param("nombre") String nombre, @Param("apellido") String apellido);
}